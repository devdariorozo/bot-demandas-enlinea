import { Inject, Injectable } from '@nestjs/common';

import {
  MANAGEMENT_DEMANDS_ONLINE_REPOSITORY,
  ManagementDemandsOnlineRepository,
} from '@domain/ports/managementDemandsOnline.ports';
import {
  PORTFOLIO_CITY_CONFIG_REPOSITORY,
  PortfolioCityConfigRepository,
} from '@domain/ports/portfolioCityConfig.ports';
import {
  AMOUNT_TYPE_REPOSITORY,
  AmountTypeRepository,
} from '@domain/ports/amountType.ports';
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

  /**
   * Ejecuta un ciclo de automatización:
   * - Valida condiciones de ejecución (bot running + horarios).
   * - Toma la siguiente demanda Abierta/Novedad y la marca En proceso.
   * - Diligencia Lugar de envío + Especialidad/Clase de Proceso en demandaenlinea.
   * - Actualiza estado a En proceso o Novedad según resultado.
   */
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

      await this.browserAutomationPort.procesarLugarEnvioYEspecialidadYClase({
        demanda,
        departamento: cityConfig.name_departament,
        ciudad: cityConfig.name_city,
        especialidad: amountType.specialty_process,
        claseProceso: amountType.class_process,
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

      if (lowerMsg.includes('waiting failed')) {
        fullDetail =
          'El portal de demandas en línea no respondió a tiempo o tardó demasiado en cargar. Revise la disponibilidad del portal y la conexión del bot.';
      } else if (lowerMsg.includes('departamento')) {
        // Mensaje corto y específico para problemas de departamento
        fullDetail =
          'No se pudo seleccionar el departamento en el portal de demandas en línea. Valide la configuración de ciudades (portfolioCityConfig) frente al portal.';
      } else if (lowerMsg.includes('especialidad')) {
        fullDetail =
          'No se pudo seleccionar la especialidad. Verifique el campo specialty_process (amountType) frente al portal.';
      } else {
        // Mensaje genérico más corto para otros errores
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
        message: 'Fallo la automatización de la demanda en demandaenlinea.',
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

