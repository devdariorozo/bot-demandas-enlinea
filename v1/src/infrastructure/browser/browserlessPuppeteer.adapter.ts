import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer, { Browser, Page } from 'puppeteer';

import {
  BrowserAutomationPort,
  LugarEnvioYProcesoInput,
} from '@domain/ports/browserAutomation.ports';
import { AppLogger } from '@infrastructure/logging/appLogger.service';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
      await delay(1500);
      await this.fillEspecialidadYClase(page, input.especialidades, input.clasesProceso);
      await delay(1500);

      const nitCarterasPropias =
        this.configService.get<string>('NIT_CARTERAS_PROPIAS')?.toString().trim() ?? '';
      const notificationEmail =
        this.configService.get<string>('DEMANDS_NOTIFICATION_EMAIL')?.toString().trim() ?? '';

      if (!nitCarterasPropias) {
        throw new Error('Variable de entorno NIT_CARTERAS_PROPIAS no configurada');
      }
      if (!notificationEmail) {
        throw new Error('Variable de entorno DEMANDS_NOTIFICATION_EMAIL no configurada');
      }

      await this.fillSujetosProcesalesDemandanteJuridico(
        page,
        nitCarterasPropias,
        notificationEmail,
      );
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

    await delay(1000);
    await page.waitForSelector('#DdlDepartamento', { timeout: 5000 });
    await page.waitForSelector('#DDlCiudad', { timeout: 5000 });
  }

  private async fillLugarEnvio(
    page: Page,
    departamento: string,
    ciudad: string,
  ): Promise<void> {
    await page.waitForSelector('#DdlDepartamento', { timeout: 30000 });
    await page.waitForFunction(
      () => {
        const select = document.querySelector<HTMLSelectElement>('#DdlDepartamento');
        return !!select && select.options.length > 2;
      },
      { timeout: 20000 },
    );

    const departamentoResult = await page.evaluate((departamentoText: string) => {
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
      const normalizedTarget = normalize(departamentoText);
      const items = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({ option: o, norm: normalize(o.textContent as string) }));
      const candidate =
        items.find((i) => i.norm === normalizedTarget) ??
        items.find((i) => i.norm.startsWith(normalizedTarget)) ??
        items.find((i) => normalizedTarget.startsWith(i.norm)) ??
        items.find((i) => i.norm.includes(normalizedTarget));
      if (!candidate) {
        return { ok: false, error: `No se encontró el departamento "${departamentoText}" en el portal` };
      }
      select.value = candidate.option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    }, departamento);

    if (!departamentoResult.ok) {
      throw new Error(departamentoResult.error ?? 'Error al seleccionar el Departamento');
    }

    await page.waitForFunction(
      () => {
        const select = document.querySelector<HTMLSelectElement>('#DDlCiudad');
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
      },
      { timeout: 20000 },
    );

    const ciudadResult = await page.evaluate((ciudadText: string) => {
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
      const normalizedTarget = normalize(ciudadText);
      const items = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({ option: o, norm: normalize(o.textContent as string) }));
      const candidate =
        items.find((i) => i.norm === normalizedTarget) ??
        items.find((i) => i.norm.startsWith(normalizedTarget)) ??
        items.find((i) => normalizedTarget.startsWith(i.norm)) ??
        items.find((i) => i.norm.includes(normalizedTarget));
      if (!candidate) {
        return { ok: false, error: `No se encontró la ciudad "${ciudadText}" en el portal` };
      }
      select.value = candidate.option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    }, ciudad);

    if (!ciudadResult.ok) {
      throw new Error(ciudadResult.error ?? 'Error al seleccionar la Ciudad');
    }

    // Dar tiempo a que aparezca el modal "Restricción de Horario" si la ciudad tiene restricción
    await delay(2500);

    // Modal: .jconfirm-holder > .jconfirm-content con "Restricción de Horario", botón .jconfirm-buttons .btn.btn-purple (sALIR)
    const horarioRestriction = await page.evaluate(() => {
      const holder = document.querySelector<HTMLElement>('.jconfirm-holder');
      if (!holder) return null;
      const content = holder.querySelector<HTMLElement>('.jconfirm-content');
      if (!content) return null;
      const rawText = content.innerText || content.textContent || '';
      if (!/restricci[oó]n de horario/i.test(rawText)) return null;
      const normalized = rawText.replace(/\s+/g, ' ').trim();
      const salirButton =
        holder.querySelector<HTMLButtonElement>('.jconfirm-buttons button.btn-purple') ??
        Array.from(holder.querySelectorAll<HTMLButtonElement>('.jconfirm-buttons button')).find(
          (b) => /salir/i.test((b.textContent ?? '').trim()),
        );
      if (salirButton) salirButton.click();
      return normalized;
    });

    if (horarioRestriction) {
      throw new Error(`HORARIO_NO_DISPONIBLE: ${horarioRestriction}`);
    }
  }

  private async fillEspecialidadYClase(
    page: Page,
    especialidades: string[],
    clasesProceso: string[],
  ): Promise<void> {
    await page.waitForSelector('#DDlEspecialidad', { timeout: 15000 });
    await page.waitForFunction(
      () => {
        const sel = document.querySelector<HTMLSelectElement>('#DDlEspecialidad');
        return !!sel && sel.options.length > 2;
      },
      { timeout: 20000 },
    );

    const especialidadList = Array.isArray(especialidades) ? especialidades : [especialidades];
    let especialidadOk = false;
    let lastEspecialidadError: string | undefined;

    for (const especialidadText of especialidadList) {
      const result = await page.evaluate((text: string) => {
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
        const normalizedTarget = normalize(text);
        const items = Array.from(select.options)
          .filter((o) => o.textContent && o.textContent.trim().length > 0)
          .map((o) => ({ option: o, norm: normalize(o.textContent as string) }));
        const candidate =
          items.find((i) => i.norm === normalizedTarget) ??
          items.find((i) => i.norm.startsWith(normalizedTarget)) ??
          items.find((i) => normalizedTarget.startsWith(i.norm)) ??
          items.find((i) => i.norm.includes(normalizedTarget));
        if (!candidate) {
          return { ok: false, error: `No se encontró la especialidad "${text}" en el portal` };
        }
        select.value = candidate.option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return { ok: true };
      }, especialidadText);

      if (result.ok) {
        especialidadOk = true;
        break;
      }
      lastEspecialidadError = result.error ?? `No se pudo seleccionar la especialidad "${especialidadText}"`;
    }

    if (!especialidadOk) {
      throw new Error(
        lastEspecialidadError ??
          'No se pudo seleccionar ninguna de las especialidades configuradas en amountType',
      );
    }

    await page.waitForFunction(
      () => {
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
      },
      { timeout: 20000 },
    );

    const clasesList = Array.isArray(clasesProceso) ? clasesProceso : [clasesProceso];
    let claseOk = false;
    let lastClaseError: string | undefined;

    for (const claseText of clasesList) {
      const result = await page.evaluate((text: string) => {
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
        const normalizedTarget = normalize(text);
        const items = Array.from(select.options)
          .filter((o) => o.textContent && o.textContent.trim().length > 0)
          .map((o) => ({ option: o, norm: normalize(o.textContent as string) }));
        const candidate =
          items.find((i) => i.norm === normalizedTarget) ??
          items.find((i) => i.norm.startsWith(normalizedTarget)) ??
          items.find((i) => normalizedTarget.startsWith(i.norm)) ??
          items.find((i) => i.norm.includes(normalizedTarget));
        if (!candidate) {
          return { ok: false, error: `No se encontró la clase de proceso "${text}" en el portal` };
        }
        select.value = candidate.option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return { ok: true };
      }, claseText);

      if (result.ok) {
        claseOk = true;
        break;
      }
      lastClaseError =
        result.error ?? `No se pudo seleccionar la clase de proceso "${claseText}" en el portal`;
    }

    if (!claseOk) {
      throw new Error(
        lastClaseError ??
          'No se pudo seleccionar ninguna de las clases de proceso configuradas en amountType',
      );
    }
  }

  private async fillSujetosProcesalesDemandanteJuridico(
    page: Page,
    nitCarterasPropias: string,
    notificationEmail: string,
  ): Promise<void> {
    await delay(500);

    const tipoSujetoResult = await page.evaluate(() => {
      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();
      const target = 'DEMANDANTE';
      const candidates: HTMLSelectElement[] = [];
      const direct = document.querySelector<HTMLSelectElement>('#DDlTipodeSujeto');
      if (direct) candidates.push(direct);
      const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('label'));
      for (const label of labels) {
        const text = normalize(label.textContent ?? '');
        if (!text.includes('TIPO DE SUJETO')) continue;
        const container =
          label.closest('.form-row, .form-group, .row') ?? label.parentElement ?? document.body;
        const sel = container.querySelector<HTMLSelectElement>('select');
        if (sel && !candidates.includes(sel)) candidates.push(sel);
      }
      const select = candidates[0];
      if (!select) return { ok: true };
      const items = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({ option: o, norm: normalize(o.textContent as string) }));
      const candidate =
        items.find((i) => i.norm === target) ??
        items.find((i) => i.norm.startsWith(target)) ??
        items.find((i) => target.startsWith(i.norm)) ??
        items.find((i) => i.norm.includes(target));
      if (!candidate) {
        return { ok: false, error: 'No se encontró la opción Demandante en Tipo de sujeto' };
      }
      select.value = candidate.option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    });

    if (!tipoSujetoResult.ok) {
      throw new Error(tipoSujetoResult.error ?? 'Error al seleccionar Tipo de sujeto Demandante');
    }

    await page.waitForSelector('#DDlTipoPersona', { timeout: 15000 });
    await page.waitForFunction(
      () => {
        const sel = document.querySelector<HTMLSelectElement>('#DDlTipoPersona');
        return !!sel && sel.options.length > 2;
      },
      { timeout: 10000 },
    );

    const tipoPersonaResult = await page.evaluate(() => {
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
      const target = 'JURIDICA';
      const items = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({ option: o, norm: normalize(o.textContent as string) }));
      const candidate =
        items.find((i) => i.norm === target) ??
        items.find((i) => i.norm.startsWith(target)) ??
        items.find((i) => target.startsWith(i.norm)) ??
        items.find((i) => i.norm.includes(target));
      if (!candidate) {
        return { ok: false, error: 'No se encontró la opción JURÍDICA en el select de Tipo de persona' };
      }
      select.value = candidate.option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    });

    if (!tipoPersonaResult.ok) {
      throw new Error(tipoPersonaResult.error ?? 'Error al seleccionar Tipo de persona JURÍDICA');
    }

    // Esperar a que el select Tipo de documento se cargue con opciones (p. ej. tras elegir JURÍDICA)
    await delay(1000);
    await page.waitForSelector('#DDlTipodocumento', { timeout: 15000 });
    await page.waitForFunction(
      () => {
        const select = document.querySelector<HTMLSelectElement>('#DDlTipodocumento');
        if (!select) return false;
        const normalize = (value: string) =>
          value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toUpperCase();
        return Array.from(select.options).some(
          (o) => o.value && o.value !== '-1' && normalize(o.textContent ?? '').includes('NIT'),
        );
      },
      { timeout: 15000 },
    );

    const tipoDocumentoResult = await page.evaluate(() => {
      const select = document.querySelector<HTMLSelectElement>('#DDlTipodocumento');
      if (!select) {
        return { ok: false, error: 'No se encontró el select de Tipo de documento (DDlTipodocumento)' };
      }
      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();
      const target = 'NIT';
      const items = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({ option: o, norm: normalize(o.textContent as string) }));
      const candidate =
        items.find((i) => i.norm === target) ??
        items.find((i) => i.norm.startsWith(target)) ??
        items.find((i) => target.startsWith(i.norm)) ??
        items.find((i) => i.norm.includes(target));
      if (!candidate) {
        return { ok: false, error: 'No se encontró la opción NIT en el select de Tipo de documento' };
      }
      select.value = candidate.option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    });

    if (!tipoDocumentoResult.ok) {
      throw new Error(tipoDocumentoResult.error ?? 'Error al seleccionar Tipo de documento NIT');
    }

    const numeroDocumentoResult = await page.evaluate((nitValue: string) => {
      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();
      const findInputByLabelText = (labelText: string): HTMLInputElement | null => {
        const target = normalize(labelText);
        const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('label'));
        for (const label of labels) {
          const text = normalize(label.textContent ?? '');
          if (!text.includes(target)) continue;
          if (label.htmlFor) {
            const el = document.getElementById(label.htmlFor);
            if (el && el.tagName === 'INPUT') return el as HTMLInputElement;
          }
          const container =
            label.closest('.form-row, .form-group, .row') ?? label.parentElement ?? document.body;
          const input = container?.querySelector<HTMLInputElement>('input.form-control, input') ?? null;
          if (input) return input;
        }
        return null;
      };
      const input = findInputByLabelText('Número Documento');
      if (!input) return { ok: false, error: 'No se encontró el campo Número Documento' };
      input.focus();
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.value = nitValue;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return { ok: true };
    }, nitCarterasPropias);

    if (!numeroDocumentoResult.ok) {
      throw new Error(
        numeroDocumentoResult.error ?? 'Error al diligenciar el campo Número Documento',
      );
    }

    await delay(1500);

    await page.evaluate(() => {
      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();
      const findInputByLabelText = (labelText: string): HTMLInputElement | null => {
        const target = normalize(labelText);
        const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('label'));
        for (const label of labels) {
          const text = normalize(label.textContent ?? '');
          if (!text.includes(target)) continue;
          if (label.htmlFor) {
            const el = document.getElementById(label.htmlFor);
            if (el && el.tagName === 'INPUT') return el as HTMLInputElement;
          }
          const container =
            label.closest('.form-row, .form-group, .row') ?? label.parentElement ?? document.body;
          const input = container?.querySelector<HTMLInputElement>('input.form-control, input') ?? null;
          if (input) return input;
        }
        return null;
      };
      const razonInput = findInputByLabelText('Razón Social');
      if (razonInput && !razonInput.value.trim()) {
        razonInput.value = 'RAZON SOCIAL PRUEBA DEMANDANTE';
        razonInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const dirInput = findInputByLabelText('Direccion');
      if (dirInput && !dirInput.value.trim()) {
        dirInput.value = 'DIRECCION PRUEBA DEMANDANTE';
        dirInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const telInput = findInputByLabelText('Telefono');
      if (telInput && !telInput.value.trim()) {
        telInput.value = '3000000000';
        telInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    const emailInput = await page.$('#IdEmail');
    if (!emailInput) {
      throw new Error('No se encontró el campo Correo para notificaciones (IdEmail)');
    }

    // Asegurar que el correo sea siempre el de .env: hacer clic, seleccionar todo, borrar y escribir el valor
    await emailInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('#IdEmail', notificationEmail, { delay: 30 });
    await page.evaluate(() => {
      const input = document.querySelector<HTMLInputElement>('#IdEmail');
      if (input) {
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await page.waitForSelector('#btnValidar', { timeout: 15000 });
    const validarBtn = await page.$('#btnValidar');
    if (!validarBtn) {
      throw new Error('No se encontró el botón "Validar correo para notificaciones"');
    }
    await validarBtn.click();

    await page.waitForFunction(
      () => {
        const content = document.querySelector<HTMLElement>('.jconfirm-content');
        if (!content) return false;
        const txt = (content.innerText || content.textContent || '').toUpperCase();
        return txt.includes('CORREO ELECTRONICO VALIDADO CON ÉXITO');
      },
      { timeout: 20000 },
    );

    await page.evaluate(() => {
      const buttons = Array.from(
        document.querySelectorAll<HTMLButtonElement>('.jconfirm-buttons .btn'),
      );
      const cont = buttons.find((b) =>
        /continuar/i.test((b.innerText || b.textContent || '').trim()),
      );
      if (cont) cont.click();
    });

    await page.waitForSelector('#btnAddAccionado', { timeout: 15000 });
    const agregarBtn = await page.$('#btnAddAccionado');
    if (!agregarBtn) {
      throw new Error('No se encontró el botón "Agregar" para Sujetos Procesales');
    }
    await agregarBtn.click();
  }
}
