import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer, { Browser, Page } from 'puppeteer';

import {
  BrowserAutomationPort,
  LugarEnvioYProcesoInput,
} from '@domain/ports/browserAutomation.ports';
import { AppLogger } from '@infrastructure/logging/appLogger.service';

@Injectable()
export class BrowserlessPuppeteerAdapter implements BrowserAutomationPort {
  constructor(
    private readonly configService: ConfigService,
    private readonly appLogger: AppLogger,
  ) {}

  async procesarLugarEnvioYEspecialidadYClase(input: LugarEnvioYProcesoInput): Promise<void> {
    const browser = await this.createBrowser();
    const page = await browser.newPage();

    try {
      await this.navigateAndAcceptModal(page);
      await this.fillLugarEnvio(page, input.departamento, input.ciudad);

      // Pausa entre ciudad y especialidad: el segundo select puede depender del primero en algunos escenarios
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await this.fillEspecialidadYClase(page, input.especialidad, input.claseProceso);

      // Pausa antes del tercer apartado (Sujetos Procesales)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await this.fillTipoPersonaNatural(page);
    } finally {
      try {
        await page.close();
      } catch {
        this.appLogger.structured({
          level: 'debug',
          context: BrowserlessPuppeteerAdapter.name,
          type: 'BROWSER',
          status: 'WARN',
          message: 'No se pudo cerrar la página de Puppeteer',
        });
      }

      try {
        await browser.close();
      } catch {
        this.appLogger.structured({
          level: 'debug',
          context: BrowserlessPuppeteerAdapter.name,
          type: 'BROWSER',
          status: 'WARN',
          message: 'No se pudo cerrar el browser de Puppeteer',
        });
      }
    }
  }

  private async createBrowser(): Promise<Browser> {
    const showBrowser =
      this.configService.get<string>('BROWSERLESS_SHOW_BROWSER') === 'true';

    if (showBrowser) {
      this.appLogger.structured({
        level: 'log',
        context: BrowserlessPuppeteerAdapter.name,
        type: 'BROWSER',
        status: 'OK',
        message:
          'Iniciando navegador local de Puppeteer en modo visible (BROWSERLESS_SHOW_BROWSER=true)',
      });

      return puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1366, height: 768 },
        args: ['--start-maximized'],
      });
    }

    const endpoint = this.configService.get<string>('BROWSERLESS_ENDPOINT');
    const tokenRaw = this.configService.get<string>('BROWSERLESS_API_TOKEN');

    if (!endpoint || !tokenRaw) {
      throw new Error(
        'Variables de entorno BROWSERLESS_ENDPOINT y BROWSERLESS_API_TOKEN son obligatorias',
      );
    }

    const token = tokenRaw.replace(/^['"]|['"]$/g, '');
    const wsBase = endpoint.replace(/^http/i, 'ws');
    const browserWSEndpoint = `${wsBase}?token=${encodeURIComponent(token)}`;

    this.appLogger.structured({
      level: 'debug',
      context: BrowserlessPuppeteerAdapter.name,
      type: 'BROWSER',
      status: 'OK',
      message: 'Conectando a Browserless',
      meta: { browserWSEndpoint: wsBase },
    });

    return puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: { width: 1366, height: 768 },
    });
  }

  private async navigateAndAcceptModal(page: Page): Promise<void> {
    const url =
      this.configService.get<string>('DEMANDA_ENLINEA_URL') ??
      'https://procesojudicial.ramajudicial.gov.co/demandaenlinea';

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('#enableCheckbox', { timeout: 15000 });

    const checkbox = await page.$('#enableCheckbox');
    if (!checkbox) {
      throw new Error(
        'No se encontró el checkbox de aceptación de términos en el modal inicial (#enableCheckbox)',
      );
    }
    await checkbox.click();

    await page.waitForSelector('.jconfirm-buttons .btn.btn-violet', { timeout: 15000 });
    const continueButtons = await page.$$('.jconfirm-buttons .btn.btn-violet');
    if (!continueButtons || continueButtons.length === 0) {
      throw new Error('No se encontró el botón Continuar en el modal inicial');
    }
    await continueButtons[0].click();

    // Pausa corta para dar tiempo a que el formulario principal se renderice
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Espera 5 segundos en el selector de departamento y ciudad
    await page.waitForSelector('#DdlDepartamento', { timeout: 5000 });
    await page.waitForSelector('#DDlCiudad', { timeout: 5000 });
  }

  private async fillLugarEnvio(
    page: Page,
    departamento: string,
    ciudad: string,
  ): Promise<void> {
    await page.waitForSelector('#DdlDepartamento', { timeout: 30000 });

    // Asegurarnos de que el combo ya tenga opciones reales (no solo "Seleccione...")
    await page.waitForFunction(() => {
      const select = document.querySelector<HTMLSelectElement>('#DdlDepartamento');
      return !!select && select.options.length > 2;
    }, { timeout: 20000 });

    const departamentoResult = await page.evaluate((departamentoText) => {
      const select = document.querySelector<HTMLSelectElement>('#DdlDepartamento');
      if (!select) {
        return { ok: false, error: 'No se encontró el select de Departamento (DdlDepartamento)' };
      }

      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();

      const normalizedTarget = normalize(departamentoText as string);
      const items = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({
          option: o,
          norm: normalize(o.textContent as string),
        }));

      const candidate =
        items.find((i) => i.norm === normalizedTarget) ??
        items.find((i) => i.norm.startsWith(normalizedTarget)) ??
        items.find((i) => normalizedTarget.startsWith(i.norm)) ??
        items.find((i) => i.norm.includes(normalizedTarget));

      if (!candidate) {
        return {
          ok: false,
          error: `No se encontró el departamento "${departamentoText}" en el portal`,
        };
      }
      const match = candidate.option;
      select.value = match.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    }, departamento);

    if (!departamentoResult.ok) {
      throw new Error(departamentoResult.error ?? 'Error al seleccionar el Departamento');
    }

    await page.waitForFunction(() => {
      const select = document.querySelector<HTMLSelectElement>('#DDlCiudad');
      if (!select) return false;
      const options = Array.from(select.options);
      // Esperar hasta que haya al menos una opción real distinta de "Seleccione..."
      return options.some((o) => {
        const text = (o.textContent ?? '').trim().toUpperCase();
        return (
          o.value !== '' &&
          o.value !== '-1' &&
          text.length > 0 &&
          text !== 'SELECCIONE...'
        );
      });
    }, { timeout: 20000 });

    const ciudadResult = await page.evaluate((ciudadText) => {
      const select = document.querySelector<HTMLSelectElement>('#DDlCiudad');
      if (!select) {
        return { ok: false, error: 'No se encontró el select de Ciudad (DDlCiudad)' };
      }

      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();

      const normalizedTarget = normalize(ciudadText as string);
      const items = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({
          option: o,
          norm: normalize(o.textContent as string),
        }));

      const candidate =
        items.find((i) => i.norm === normalizedTarget) ??
        items.find((i) => i.norm.startsWith(normalizedTarget)) ??
        items.find((i) => normalizedTarget.startsWith(i.norm)) ??
        items.find((i) => i.norm.includes(normalizedTarget));

      if (!candidate) {
        return {
          ok: false,
          error: `No se encontró la ciudad "${ciudadText}" en el portal`,
        };
      }
      const match = candidate.option;
      select.value = match.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    }, ciudad);

    if (!ciudadResult.ok) {
      throw new Error(ciudadResult.error ?? 'Error al seleccionar la Ciudad');
    }
  }

  private async fillEspecialidadYClase(
    page: Page,
    especialidad: string,
    claseProceso: string,
  ): Promise<void> {
    await page.waitForSelector('#DDlEspecialidad', { timeout: 15000 });
    await page.waitForFunction(() => {
      const sel = document.querySelector<HTMLSelectElement>('#DDlEspecialidad');
      return !!sel && sel.options.length > 2;
    }, { timeout: 20000 });

    const especialidadResult = await page.evaluate((especialidadText) => {
      const select = document.querySelector<HTMLSelectElement>('#DDlEspecialidad');
      if (!select) {
        return { ok: false, error: 'No se encontró el select de Especialidad (DDlEspecialidad)' };
      }

      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();

      const normalizedTarget = normalize(especialidadText as string);
      const items = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({
          option: o,
          norm: normalize(o.textContent as string),
        }));

      const candidate =
        items.find((i) => i.norm === normalizedTarget) ??
        items.find((i) => i.norm.startsWith(normalizedTarget)) ??
        items.find((i) => normalizedTarget.startsWith(i.norm)) ??
        items.find((i) => i.norm.includes(normalizedTarget));

      if (!candidate) {
        return {
          ok: false,
          error: `No se encontró la especialidad "${especialidadText}" en el portal`,
        };
      }
      const match = candidate.option;
      select.value = match.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    }, especialidad);

    if (!especialidadResult.ok) {
      throw new Error(especialidadResult.error ?? 'Error al seleccionar la Especialidad');
    }

    // Esperar a que DDlProceso cargue opciones reales (depende de la especialidad elegida)
    await page.waitForFunction(() => {
      const select = document.querySelector<HTMLSelectElement>('#DDlProceso');
      if (!select) return false;
      const options = Array.from(select.options);
      return options.some((o) => {
        const text = (o.textContent ?? '').trim().toUpperCase();
        return (
          o.value !== '' &&
          o.value !== '-1' &&
          text.length > 0 &&
          text !== 'SELECCIONE...'
        );
      });
    }, { timeout: 20000 });

    const claseResult = await page.evaluate((claseText) => {
      const select = document.querySelector<HTMLSelectElement>('#DDlProceso');
      if (!select) {
        return { ok: false, error: 'No se encontró el select de Clase de Proceso (DDlProceso)' };
      }

      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();

      const normalizedTarget = normalize(claseText as string);
      const items = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({
          option: o,
          norm: normalize(o.textContent as string),
        }));

      const candidate =
        items.find((i) => i.norm === normalizedTarget) ??
        items.find((i) => i.norm.startsWith(normalizedTarget)) ??
        items.find((i) => normalizedTarget.startsWith(i.norm)) ??
        items.find((i) => i.norm.includes(normalizedTarget));

      if (!candidate) {
        return {
          ok: false,
          error: `No se encontró la clase de proceso "${claseText}" en el portal`,
        };
      }
      const match = candidate.option;
      select.value = match.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    }, claseProceso);

    if (!claseResult.ok) {
      throw new Error(claseResult.error ?? 'Error al seleccionar la Clase de Proceso');
    }
  }

  private async fillTipoPersonaNatural(page: Page): Promise<void> {
    await page.waitForSelector('#DDlTipoPersona', { timeout: 15000 });
    await page.waitForFunction(() => {
      const sel = document.querySelector<HTMLSelectElement>('#DDlTipoPersona');
      return !!sel && sel.options.length > 2;
    }, { timeout: 10000 });

    const result = await page.evaluate(() => {
      const select = document.querySelector<HTMLSelectElement>('#DDlTipoPersona');
      if (!select) {
        return { ok: false, error: 'No se encontró el select de Tipo de persona (DDlTipoPersona)' };
      }

      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();

      const target = 'NATURAL';
      const items = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({
          option: o,
          norm: normalize(o.textContent as string),
        }));

      const candidate =
        items.find((i) => i.norm === target) ??
        items.find((i) => i.norm.includes(target));

      if (!candidate) {
        return {
          ok: false,
          error: 'No se encontró la opción NATURAL en el select de Tipo de persona',
        };
      }
      const match = candidate.option;
      select.value = match.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    });

    if (!result.ok) {
      throw new Error(result.error ?? 'Error al seleccionar Tipo de persona NATURAL');
    }
  }
}

