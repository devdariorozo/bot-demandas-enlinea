import { Inject, Injectable } from '@nestjs/common';

import {
  MANAGEMENT_DEMANDS_ONLINE_REPOSITORY,
  ManagementDemandsOnlineRepository,
} from '@domain/ports/managementDemandsOnline.ports';
import {
  PORTFOLIO_CITY_CONFIG_REPOSITORY,
  PortfolioCityConfigRepository,
} from '@domain/ports/portfolioCityConfig.ports';
import { AMOUNT_TYPE_REPOSITORY, AmountTypeRepository } from '@domain/ports/amountType.ports';
import {
  BROWSER_AUTOMATION_PORT,
  BrowserAutomationPort,
} from '@domain/ports/browserAutomation.ports';
import { BotControlService } from './botControl.service';
import { DataBasesService } from './dataBases.service';
import { AppLogger } from '@infrastructure/logging/appLogger.service';

@Injectable()
export class DemandsOnlineAutomationService {
  private running = false;

  constructor(
    @Inject(MANAGEMENT_DEMANDS_ONLINE_REPOSITORY)
    private readonly managementDemandsOnlineRepository: ManagementDemandsOnlineRepository,
    @Inject(PORTFOLIO_CITY_CONFIG_REPOSITORY)
    private readonly portfolioCityConfigRepository: PortfolioCityConfigRepository,
    @Inject(AMOUNT_TYPE_REPOSITORY)
    private readonly amountTypeRepository: AmountTypeRepository,
    @Inject(BROWSER_AUTOMATION_PORT)
    private readonly browserAutomationPort: BrowserAutomationPort,
    private readonly botControlService: BotControlService,
    private readonly dataBasesService: DataBasesService,
    private readonly appLogger: AppLogger,
  ) {}

  async runOnce(): Promise<void> {
    if (this.running) {
      this.appLogger.structured({
        level: 'debug',
        context: DemandsOnlineAutomationService.name,
        type: 'AUTOMATION_JOB',
        status: 'WARN',
        message: 'Ciclo de automatización anterior aún en ejecución; se omite este ciclo.',
      });
      return;
    }

    this.running = true;

    if (!this.botControlService.isRunning()) {
      this.appLogger.structured({
        level: 'debug',
        context: DemandsOnlineAutomationService.name,
        type: 'AUTOMATION_JOB',
        status: 'WARN',
        message: 'Bot detenido: no se ejecuta la automatización de demandas en línea.',
      });
      this.running = false;
      return;
    }

    const runtime = await this.botControlService.checkRuntimeConditions();
    if (!runtime.ok) {
      this.appLogger.structured({
        level: 'debug',
        context: DemandsOnlineAutomationService.name,
        type: 'AUTOMATION_JOB',
        status: 'WARN',
        message: 'Bot no puede trabajar en este momento para automatizar demandas.',
        meta: { reason: runtime.reason },
      });
      this.running = false;
      return;
    }

    const currentDataBasesId = this.botControlService.getCurrentDataBasesId();
    if (!currentDataBasesId) {
      this.appLogger.structured({
        level: 'debug',
        context: DemandsOnlineAutomationService.name,
        type: 'AUTOMATION_JOB',
        status: 'WARN',
        message:
          'No hay configuración data_bases seleccionada; no se puede determinar la cartera para automatizar demandas.',
      });
      this.running = false;
      return;
    }

    let portfolioTypeId: number;
    try {
      const dbRecord = await this.dataBasesService.findById(currentDataBasesId);
      portfolioTypeId = dbRecord.portfolio_type_id;
    } catch {
      this.appLogger.structured({
        level: 'debug',
        context: DemandsOnlineAutomationService.name,
        type: 'AUTOMATION_JOB',
        status: 'WARN',
        message:
          'La configuración data_bases seleccionada no existe; no se puede determinar la cartera para automatizar demandas.',
        meta: { data_bases_id: currentDataBasesId },
      });
      this.running = false;
      return;
    }

    const demanda =
      await this.managementDemandsOnlineRepository.findNextPendingAndMarkInProcess(
        portfolioTypeId,
      );
    if (!demanda) {
      this.appLogger.structured({
        level: 'debug',
        context: DemandsOnlineAutomationService.name,
        type: 'AUTOMATION_JOB',
        status: 'OK',
        message:
          'No se encontraron demandas con estado Abierta o Novedad para automatizar en este ciclo.',
      });
      this.running = false;
      return;
    }

    this.appLogger.structured({
      level: 'debug',
      context: DemandsOnlineAutomationService.name,
      type: 'AUTOMATION_JOB',
      status: 'OK',
      message: 'Demanda tomada para automatización en demandaenlinea.',
      meta: {
        management_demands_online_id: demanda.id,
        management_status: demanda.management_status,
      },
    });

    try {
      const cityConfig = await this.portfolioCityConfigRepository.findById(
        demanda.portfolio_city_config_id,
      );
      const amountType = await this.amountTypeRepository.findById(demanda.amount_type_id);

      const especialidades = Array.isArray(amountType.specialty_process)
        ? amountType.specialty_process
        : [amountType.specialty_process as unknown as string];
      const clasesProceso = Array.isArray(amountType.class_process)
        ? amountType.class_process
        : [amountType.class_process as unknown as string];

      await this.browserAutomationPort.procesarLugarEnvioYEspecialidadYClase({
        demanda,
        departamento: cityConfig.name_departament,
        ciudad: cityConfig.name_city,
        especialidades,
        clasesProceso,
      });

      await this.managementDemandsOnlineRepository.update({
        ...demanda,
        management_status: 'En proceso',
        detail: 'Bot registrando demanda en linea',
        updated_at: new Date(),
      });

      this.appLogger.structured({
        level: 'debug',
        context: DemandsOnlineAutomationService.name,
        type: 'AUTOMATION_JOB',
        status: 'OK',
        message:
          'Demanda automatizada correctamente hasta Lugar de envío y Especialidad/Clase de Proceso.',
        meta: {
          management_demands_online_id: demanda.id,
          management_status: 'En proceso',
        },
      });
    } catch (err) {
      const error = err as Error;
      const lowerMsg = error.message.toLowerCase();
      let fullDetail: string;

      if (lowerMsg.includes('horario_no_disponible') || lowerMsg.includes('restriccion de horario')) {
        const msg = error.message;
        const idx = msg.indexOf(':');
        const portalMessage = idx >= 0 ? msg.slice(idx + 1).trim() : msg;

        let cityLabel = '';
        const cityMatch = portalMessage.match(/para la ciudad de\s+([A-ZÁÉÍÓÚÑ\s]+)/i);
        if (cityMatch?.[1]) {
          const rawCity = cityMatch[1].trim();
          const normCity = rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLowerCase();
          cityLabel = ` (${normCity})`;
        }

        const hours = portalMessage.match(/\d{1,2}:\d{2}/g) ?? [];
        let horarioPart = '';
        if (hours.length >= 2) {
          horarioPart = ` Horario: ${hours[0]}-${hours[1]}.`;
        }
        if (hours.length >= 4) {
          horarioPart += ` Receso: ${hours[2]}-${hours[3]}.`;
        }

        fullDetail = `Restricción de horario en demandaenlinea${cityLabel}.${horarioPart}`;
      } else if (lowerMsg.includes('waiting failed')) {
        fullDetail =
          'El portal de demandas en línea no respondió a tiempo o tardó demasiado en cargar. Revise la disponibilidad del portal y la conexión del bot.';
      } else if (lowerMsg.includes('departamento')) {
        fullDetail =
          'No se pudo seleccionar el departamento en el portal de demandas en línea. Valide la configuración de ciudades (portfolioCityConfig) frente al portal.';
      } else if (lowerMsg.includes('especialidad')) {
        fullDetail =
          'No se pudo seleccionar la especialidad. Verifique el campo specialty_process (amountType) frente al portal.';
      } else {
        fullDetail =
          'Error automatizando demanda en demandaenlinea. Revise los logs técnicos del bot para más detalle.';
      }

      const truncatedDetail =
        fullDetail.length > 480 ? `${fullDetail.slice(0, 480)}...` : fullDetail;

      await this.managementDemandsOnlineRepository.update({
        ...demanda,
        management_status: 'Novedad',
        detail: truncatedDetail,
        updated_at: new Date(),
      });

      this.appLogger.structured({
        level: 'error',
        context: DemandsOnlineAutomationService.name,
        type: 'AUTOMATION_JOB',
        status: 'ERROR',
        message: 'Falló la automatización de la demanda en demandaenlinea.',
        meta: {
          management_demands_online_id: demanda.id,
          error: error.message,
        },
        stack: error.stack,
      });
    } finally {
      this.running = false;
    }
  }
}
