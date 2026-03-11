import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer, { Browser, Page } from 'puppeteer';

import { BrowserAutomationPort, LugarEnvioYProcesoInput } from '@domain/ports/browserAutomation.ports';
import { AppLogger } from '@infrastructure/logging/appLogger.service';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class BrowserlessPuppeteerAdapter implements BrowserAutomationPort {
  constructor(
    private readonly configService: ConfigService,
    private readonly appLogger: AppLogger,
  ) {}

  private normalizeUpper(value: string | undefined | null): string {
    if (value == null) return '';
    const trimmed = value.toString().trim();
    if (!trimmed) return '';
    return trimmed
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  async procesarLugarEnvioYEspecialidadYClase(input: LugarEnvioYProcesoInput): Promise<void> {
    const browser = await this.createBrowser();
    const page = await browser.newPage();

    try {
      await this.navigateAndAcceptModal(page);
      await this.fillLugarEnvio(page, input.departamento, input.ciudad);
      // Dar tiempo a que el portal termine de cargar/normalizar los datos asociados al Lugar de Envío
      await delay(500);
      await this.fillEspecialidadYClase(page, input.especialidades, input.clasesProceso);
      await delay(1500);

      const nitFromCompany = input.demandante?.nit?.toString().trim() ?? '';
      const notificationEmailFromCompany =
        input.demandante?.email_notifications?.toString().trim() ?? '';

      const nitCarterasPropias =
        nitFromCompany ||
        this.configService.get<string>('NIT_CARTERAS_PROPIAS')?.toString().trim() ||
        '';
      const notificationEmail =
        notificationEmailFromCompany ||
        this.configService.get<string>('DEMANDS_NOTIFICATION_EMAIL')?.toString().trim() ||
        '';

      if (!nitCarterasPropias) {
        throw new Error(
          'No se encontró NIT del demandante ni en company_type ni en la variable de entorno NIT_CARTERAS_PROPIAS',
        );
      }
      if (!notificationEmail) {
        throw new Error(
          'No se encontró correo de notificaciones ni en company_type ni en DEMANDS_NOTIFICATION_EMAIL',
        );
      }

      await this.fillSujetosProcesalesDemandanteJuridico(page, {
        nit: nitCarterasPropias,
        company_name: input.demandante?.company_name ?? '',
        address: input.demandante?.address ?? '',
        contact_number: input.demandante?.contact_number ?? '',
        email_notifications: notificationEmail,
      }, {
        document_type_name: input.demandado?.document_type_name ?? '',
        identification: input.demandado?.identification ?? '',
        completed_name: input.demandado?.completed_name ?? '',
        address: this.normalizeUpper(input.demandado?.address ?? ''),
        phone: input.demandado?.phone ?? '',
      });
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

    await delay(500);
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
    await delay(1500);

    // Modal: .jconfirm-holder > .jconfirm-content con "Restricción de Horario", botón .jconfirm-buttons .btn.btn-purple (SALIR)
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
    demandante: {
      nit: string;
      company_name: string;
      address: string;
      contact_number: string;
      email_notifications: string;
    },
    demandado?: {
      document_type_name: string;
      identification: string;
      completed_name: string;
      address: string;
      phone: string;
    },
  ): Promise<void> {
    // Fase 1: configuración de Sujetos Procesales para el DEMANDANTE JURÍDICO
    // 1) Seleccionar Tipo de sujeto = DEMANDANTE
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

    // 2) Seleccionar Tipo de persona = JURÍDICA
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

    // 3) Seleccionar Tipo de documento = NIT
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

    // 4) Diligenciar Número de documento con el NIT configurado
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
      // Retirar el foco explícitamente para que el portal procese el cambio
      input.blur();
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    }, demandante.nit);

    if (!numeroDocumentoResult.ok) {
      throw new Error(
        numeroDocumentoResult.error ?? 'Error al diligenciar el campo Número Documento',
      );
    }

    // Dar tiempo al portal para que termine de cargar/normalizar los datos asociados al NIT
    await delay(1500);

    await page.evaluate(
      (data: { company_name: string; address: string; contact_number: string }) => {
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
        if (razonInput && data.company_name) {
          razonInput.value = data.company_name;
          razonInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        const dirInput = document.querySelector<HTMLInputElement>('#IdDireccion');
        if (dirInput && data.address) {
          dirInput.value = data.address;
          dirInput.dispatchEvent(new Event('input', { bubbles: true }));
          dirInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const telInput = document.querySelector<HTMLInputElement>('#IdTelefono');
        if (telInput && data.contact_number) {
          telInput.value = data.contact_number;
          telInput.dispatchEvent(new Event('input', { bubbles: true }));
          telInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      },
      {
        company_name: demandante.company_name,
        address: demandante.address,
        contact_number: demandante.contact_number,
      },
    );

    // Esperar un poco extra antes de intervenir el correo, ya que el portal puede alterar el campo
    await delay(1000);

    const emailInput = await page.$('#IdEmail');
    if (!emailInput) {
      throw new Error('No se encontró el campo Correo para notificaciones (IdEmail)');
    }

    // Asegurar que el correo sea siempre el configurado: hacer clic, seleccionar todo, borrar y escribir el valor
    await emailInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('#IdEmail', demandante.email_notifications, { delay: 30 });
    await page.evaluate((expected: string) => {
      const input = document.querySelector<HTMLInputElement>('#IdEmail');
      if (input) {
        // Forzar que el valor final sea exactamente el esperado
        if (input.value !== expected) {
          input.value = expected;
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, demandante.email_notifications);

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

    // Dar tiempo a que el modal cierre y el formulario quede estable
    await delay(1000);

    await page.waitForSelector('#btnAddAccionado', { timeout: 15000 });
    const agregarBtn = await page.$('#btnAddAccionado');
    if (!agregarBtn) {
      throw new Error('No se encontró el botón "Agregar" para Sujetos Procesales');
    }
    await agregarBtn.click();

    // Dar tiempo a que el sujeto procesal Demandante quede agregado en la grilla
    await delay(1000);

    // Si no hay datos del demandado configurados, dejamos el flujo hasta aquí.
    if (!demandado || !demandado.identification) {
      this.appLogger.structured({
        level: 'debug',
        context: BrowserlessPuppeteerAdapter.name,
        type: 'BROWSER',
        status: 'WARN',
        message:
          'Datos de demandado no proporcionados en input.demandado; el flujo se detiene luego de agregar Demandante',
      });
      return;
    }

    // Fase 2: DEMANDADO NATURAL
    // 1) Seleccionar Tipo de sujeto = DEMANDADO en #DDlTipoSujeto
    await page.waitForSelector('#DDlTipoSujeto', { timeout: 15000 });
    await page.waitForFunction(
      () => {
        const sel = document.querySelector<HTMLSelectElement>('#DDlTipoSujeto');
        return !!sel && sel.options.length > 2;
      },
      { timeout: 10000 },
    );

    const tipoSujetoDemandadoResult = await page.evaluate(() => {
      const select = document.querySelector<HTMLSelectElement>('#DDlTipoSujeto');
      if (!select) {
        return { ok: false, error: 'No se encontró el select de Tipo de sujeto (DDlTipoSujeto)' };
      }
      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();
      const target = 'DEMANDADO';
      const items = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({ option: o, norm: normalize(o.textContent as string) }));
      const candidate =
        items.find((i) => i.norm === target) ??
        items.find((i) => i.norm.startsWith(target)) ??
        items.find((i) => target.startsWith(i.norm)) ??
        items.find((i) => i.norm.includes(target));
      if (!candidate) {
        return { ok: false, error: 'No se encontró la opción DEMANDADO en Tipo de sujeto (DDlTipoSujeto)' };
      }
      select.value = candidate.option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    });

    if (!tipoSujetoDemandadoResult.ok) {
      throw new Error(
        tipoSujetoDemandadoResult.error ??
          'Error al seleccionar Tipo de sujeto DEMANDADO en la fase de Demandado',
      );
    }

    // 2) Seleccionar Tipo de persona = NATURAL en #DDlTipoPersona
    await page.waitForSelector('#DDlTipoPersona', { timeout: 15000 });
    await page.waitForFunction(
      () => {
        const sel = document.querySelector<HTMLSelectElement>('#DDlTipoPersona');
        return !!sel && sel.options.length > 2;
      },
      { timeout: 10000 },
    );

    const tipoPersonaNaturalResult = await page.evaluate(() => {
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
        .map((o) => ({ option: o, norm: normalize(o.textContent as string) }));
      const candidate =
        items.find((i) => i.norm === target) ??
        items.find((i) => i.norm.startsWith(target)) ??
        items.find((i) => target.startsWith(i.norm)) ??
        items.find((i) => i.norm.includes(target));
      if (!candidate) {
        return { ok: false, error: 'No se encontró la opción NATURAL en el select de Tipo de persona' };
      }
      select.value = candidate.option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    });

    if (!tipoPersonaNaturalResult.ok) {
      throw new Error(
        tipoPersonaNaturalResult.error ??
          'Error al seleccionar Tipo de persona NATURAL para el Demandado',
      );
    }

    // 3) Seleccionar Tipo de documento del demandado en #DDlTipodocumento
    await delay(1000);
    await page.waitForSelector('#DDlTipodocumento', { timeout: 15000 });
    await page.waitForFunction(
      () => {
        const select = document.querySelector<HTMLSelectElement>('#DDlTipodocumento');
        if (!select) return false;
        return Array.from(select.options).some(
          (o) => o.value && o.value !== '-1' && (o.textContent ?? '').trim().length > 0,
        );
      },
      { timeout: 15000 },
    );

    const tipoDocumentoDemandadoResult = await page.evaluate((rawDocType: string) => {
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
      const source = normalize(rawDocType);

      let target: string | null = null;
      if (source.includes('CIUDADANIA')) {
        target = 'CEDULA DE CIUDADANIA';
      } else if (source.includes('EXTRANJERIA')) {
        target = 'CEDULA DE EXTRANJERIA';
      } else if (source.includes('PASAPORTE') || source === 'PA') {
        target = 'PASAPORTE';
      }

      const options = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({ option: o, norm: normalize(o.textContent as string) }));

      let candidate;
      if (target) {
        const targetNorm = normalize(target);
        candidate =
          options.find((i) => i.norm === targetNorm) ??
          options.find((i) => i.norm.startsWith(targetNorm)) ??
          options.find((i) => targetNorm.startsWith(i.norm)) ??
          options.find((i) => i.norm.includes(targetNorm));
      } else {
        // Fallback: buscar por el texto original normalizado
        candidate =
          options.find((i) => i.norm === source) ??
          options.find((i) => i.norm.startsWith(source)) ??
          options.find((i) => source.startsWith(i.norm)) ??
          options.find((i) => i.norm.includes(source));
      }

      if (!candidate) {
        return {
          ok: false,
          error: `No se encontró la opción de Tipo de documento para el demandado a partir de "${rawDocType}"`,
        };
      }

      select.value = candidate.option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    }, demandado.document_type_name ?? '');

    if (!tipoDocumentoDemandadoResult.ok) {
      throw new Error(
        tipoDocumentoDemandadoResult.error ??
          'Error al seleccionar Tipo de documento para el Demandado',
      );
    }

    // 4) Diligenciar Número de documento del Demandado
    const numeroDocumentoDemandadoResult = await page.evaluate((idValue: string) => {
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
      if (!input) return { ok: false, error: 'No se encontró el campo Número Documento para el Demandado' };
      input.focus();
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.value = idValue;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.blur();
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    }, demandado.identification ?? '');

    if (!numeroDocumentoDemandadoResult.ok) {
      throw new Error(
        numeroDocumentoDemandadoResult.error ??
          'Error al diligenciar el campo Número Documento del Demandado',
      );
    }

    // Dar tiempo al portal para que termine de cargar/normalizar los datos asociados al documento
    await delay(1500);

    // 5) Diligenciar nombres y apellidos usando completed_name
    await page.evaluate((completedNameRaw: string) => {
      const normalizeBase = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .toUpperCase();

      const splitCompletedNameToParts = (raw: string) => {
        const name = normalizeBase(raw);
        if (!name) {
          return { firstName: '', secondName: '', firstLastName: '', secondLastName: '' };
        }
        const parts = name.split(' ').filter(Boolean);
        const count = parts.length;

        let firstName = '';
        let secondName = '';
        let firstLastName = '';
        let secondLastName = '';

        if (count === 1) {
          firstName = parts[0];
        } else if (count === 2) {
          firstName = parts[0];
          firstLastName = parts[1];
        } else if (count === 3) {
          firstName = parts[0];
          firstLastName = parts[1];
          secondLastName = parts[2];
        } else {
          firstName = parts[0];
          secondName = parts[1];
          firstLastName = parts[count - 2];
          secondLastName = parts[count - 1];
        }
        return { firstName, secondName, firstLastName, secondLastName };
      };

      const normalizeLabel = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();

      const findInputByLabelText = (labelText: string): HTMLInputElement | null => {
        const target = normalizeLabel(labelText);
        const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('label'));
        for (const label of labels) {
          const text = normalizeLabel(label.textContent ?? '');
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

      const { firstName, secondName, firstLastName, secondLastName } =
        splitCompletedNameToParts(completedNameRaw ?? '');

      const applyValue = (label: string, value: string) => {
        const input = findInputByLabelText(label);
        if (!input) return;
        input.focus();
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        if (value) {
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        input.blur();
        input.dispatchEvent(new Event('change', { bubbles: true }));
      };

      applyValue('Primer Nombre', firstName);
      applyValue('Segundo Nombre', secondName);
      applyValue('Primer Apellido', firstLastName);
      applyValue('Segundo Apellido', secondLastName);
    }, demandado.completed_name ?? '');

    // 6) Tipo de discapacidad = No Aplica
    await page.waitForSelector('#DDlTipodiscapacidad', { timeout: 15000 });
    const tipoDiscapacidadResult = await page.evaluate(() => {
      const select = document.querySelector<HTMLSelectElement>('#DDlTipodiscapacidad');
      if (!select) {
        return { ok: false, error: 'No se encontró el select de Tipo de discapacidad (DDlTipodiscapacidad)' };
      }
      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();
      const target = 'NO APLICA';
      const items = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({ option: o, norm: normalize(o.textContent as string) }));
      const candidate =
        items.find((i) => i.norm === target) ??
        items.find((i) => i.norm.startsWith(target)) ??
        items.find((i) => target.startsWith(i.norm)) ??
        items.find((i) => i.norm.includes(target));
      if (!candidate) {
        return { ok: false, error: 'No se encontró la opción NO APLICA en Tipo de discapacidad' };
      }
      select.value = candidate.option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    });

    if (!tipoDiscapacidadResult.ok) {
      throw new Error(
        tipoDiscapacidadResult.error ??
          'Error al seleccionar Tipo de discapacidad = No Aplica para el Demandado',
      );
    }

    // 7) Localidad = 00 - DESCONOCIDA / DUDOSA (41-03)
    await page.waitForSelector('#DDlLocalidad', { timeout: 15000 });
    const localidadResult = await page.evaluate(() => {
      const select = document.querySelector<HTMLSelectElement>('#DDlLocalidad');
      if (!select) {
        return { ok: false, error: 'No se encontró el select de Localidad (DDlLocalidad)' };
      }
      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();
      const target = '00 - DESCONOCIDA / DUDOSA (41-03)';
      const items = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({ option: o, norm: normalize(o.textContent as string) }));
      const candidate =
        items.find((i) => i.norm === normalize(target)) ??
        items.find((i) => i.norm.startsWith('00 - DESCONOCIDA')) ??
        items.find((i) => i.norm.includes('DESCONOCIDA / DUDOSA'));
      if (!candidate) {
        return {
          ok: false,
          error:
            'No se encontró la opción "00 - DESCONOCIDA / DUDOSA (41-03)" en el select de Localidad (DDlLocalidad)',
        };
      }
      select.value = candidate.option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    });

    if (!localidadResult.ok) {
      throw new Error(
        localidadResult.error ??
          'Error al seleccionar la Localidad "00 - DESCONOCIDA / DUDOSA (41-03)" para el Demandado',
      );
    }

    // 8) Dirección del Demandado (IdDireccion) en mayúsculas
    await page.evaluate((direccion: string) => {
      const input = document.querySelector<HTMLInputElement>('#IdDireccion');
      if (!input) return;
      input.focus();
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      if (direccion) {
        input.value = direccion;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      input.blur();
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, demandado.address ?? '');

    // 9) Teléfono del Demandado (IdTelefono)
    await page.evaluate((telefono: string) => {
      const input = document.querySelector<HTMLInputElement>('#IdTelefono');
      if (!input) return;
      input.focus();
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      if (telefono) {
        input.value = telefono;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      input.blur();
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, demandado.phone ?? '');

    // Dar tiempo similar al del Demandante antes de agregar el Demandado
    await delay(1000);

    const agregarDemandadoBtn = await page.$('#btnAddAccionado');
    if (!agregarDemandadoBtn) {
      throw new Error('No se encontró el botón "Agregar" para agregar el Demandado');
    }
    await agregarDemandadoBtn.click();

    // Dar tiempo a que el Demandado quede agregado en la grilla
    await delay(1000);

    // Fase 3: preparar el formulario para el APODERADO NATURAL y dejar el flujo detenido allí
    await page.waitForSelector('#DDlTipoSujeto', { timeout: 15000 });
    await page.waitForFunction(
      () => {
        const sel = document.querySelector<HTMLSelectElement>('#DDlTipoSujeto');
        return !!sel && sel.options.length > 2;
      },
      { timeout: 10000 },
    );

    const tipoSujetoApoderadoResult = await page.evaluate(() => {
      const select = document.querySelector<HTMLSelectElement>('#DDlTipoSujeto');
      if (!select) {
        return { ok: false, error: 'No se encontró el select de Tipo de sujeto (DDlTipoSujeto)' };
      }
      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();
      const target = 'APODERADO';
      const items = Array.from(select.options)
        .filter((o) => o.textContent && o.textContent.trim().length > 0)
        .map((o) => ({ option: o, norm: normalize(o.textContent as string) }));
      const candidate =
        items.find((i) => i.norm === target) ??
        items.find((i) => i.norm.startsWith(target)) ??
        items.find((i) => target.startsWith(i.norm)) ??
        items.find((i) => i.norm.includes(target));
      if (!candidate) {
        return { ok: false, error: 'No se encontró la opción APODERADO en Tipo de sujeto (DDlTipoSujeto)' };
      }
      select.value = candidate.option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    });

    if (!tipoSujetoApoderadoResult.ok) {
      throw new Error(
        tipoSujetoApoderadoResult.error ??
          'Error al seleccionar Tipo de sujeto APODERADO en la fase de Apoderado',
      );
    }

    await page.waitForSelector('#DDlTipoPersona', { timeout: 15000 });
    await page.waitForFunction(
      () => {
        const sel = document.querySelector<HTMLSelectElement>('#DDlTipoPersona');
        return !!sel && sel.options.length > 2;
      },
      { timeout: 10000 },
    );

    const tipoPersonaApoderadoNaturalResult = await page.evaluate(() => {
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
        .map((o) => ({ option: o, norm: normalize(o.textContent as string) }));
      const candidate =
        items.find((i) => i.norm === target) ??
        items.find((i) => i.norm.startsWith(target)) ??
        items.find((i) => target.startsWith(i.norm)) ??
        items.find((i) => i.norm.includes(target));
      if (!candidate) {
        return { ok: false, error: 'No se encontró la opción NATURAL en el select de Tipo de persona' };
      }
      select.value = candidate.option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    });

    if (!tipoPersonaApoderadoNaturalResult.ok) {
      throw new Error(
        tipoPersonaApoderadoNaturalResult.error ??
          'Error al seleccionar Tipo de persona NATURAL para el Apoderado',
      );
    }

    // Pausa visual: dejar el flujo en el formulario del Apoderado NATURAL
    await delay(3000);
  }
}
