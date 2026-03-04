// Responsabilidad: job de sincronización de demandas pendientes desde BDs externas a management_demands_online.

import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DATABASES_REPOSITORY, DataBasesRepository } from '@domain/ports/dataBases.ports';
import {
  PORTFOLIO_CITY_CONFIG_REPOSITORY,
  PortfolioCityConfigRepository,
} from '@domain/ports/portfolioCityConfig.ports';
import {
  MANAGEMENT_DEMANDS_ONLINE_REPOSITORY,
  ManagementDemandsOnlineRepository,
  CreateManagementDemandsOnlineInput,
} from '@domain/ports/managementDemandsOnline.ports';
import { AMOUNT_TYPE_REPOSITORY, AmountTypeRepository } from '@domain/ports/amountType.ports';
import { BotControlService } from './botControl.service';
import { AppLogger } from '@infrastructure/logging/appLogger.service';

const DEFAULT_STATE_TYPE_ID = 1;
const LAWSUITS_PK = 'id'; // lawsuits se consulta por id = lawsuit_id

@Injectable()
export class DemandsPendingSyncService implements OnModuleInit, OnModuleDestroy {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject(DATABASES_REPOSITORY)
    private readonly dataBasesRepository: DataBasesRepository,
    @Inject(PORTFOLIO_CITY_CONFIG_REPOSITORY)
    private readonly portfolioCityConfigRepository: PortfolioCityConfigRepository,
    @Inject(MANAGEMENT_DEMANDS_ONLINE_REPOSITORY)
    private readonly managementDemandsOnlineRepository: ManagementDemandsOnlineRepository,
    @Inject(AMOUNT_TYPE_REPOSITORY)
    private readonly amountTypeRepository: AmountTypeRepository,
    private readonly configService: ConfigService,
    private readonly botControlService: BotControlService,
    private readonly appLogger: AppLogger,
  ) {}

  /** Ejecuta el sync: por cada data_bases y cada base, cruce lawsuits × lca × pcc, resolución amount_type, creación en management_demands_online. */
  async runSync(): Promise<{ processed: number; created: number; skipped: number }> {
    let created = 0;
    let skipped = 0;
    let processed = 0;

    const currentDataBasesId = this.botControlService.getCurrentDataBasesId();
    if (!currentDataBasesId) {
      this.appLogger.structured({
        level: 'debug',
        context: DemandsPendingSyncService.name,
        type: 'SYNC_JOB',
        status: 'WARN',
        message:
          'runSync no se ejecuta porque no hay configuración data_bases seleccionada en el bot.',
      });
      return { processed, created, skipped };
    }

    let dbRecord;
    try {
      dbRecord = await this.dataBasesRepository.findById(currentDataBasesId);
    } catch {
      this.appLogger.structured({
        level: 'warn',
        context: DemandsPendingSyncService.name,
        type: 'SYNC_JOB',
        status: 'WARN',
        message:
          'runSync no se ejecuta porque la configuración data_bases seleccionada no existe.',
        meta: { data_bases_id: currentDataBasesId },
      });
      return { processed, created, skipped };
    }

    // Validar que la cartera (portfolio_type) esté activa según state_type
    const portfolioState = dbRecord.portfolio_state_type_name?.trim().toLowerCase();
    if (!portfolioState || portfolioState !== 'active') {
      this.appLogger.structured({
        level: 'warn',
        context: DemandsPendingSyncService.name,
        type: 'SYNC_JOB',
        status: 'WARN',
        message:
          'runSync no se ejecuta porque la cartera (portfolio) de la configuración data_bases seleccionada no está activa.',
        meta: {
          data_bases_id: currentDataBasesId,
          portfolio_type_id: dbRecord.portfolio_type_id,
          portfolio_state_type_name: dbRecord.portfolio_state_type_name ?? null,
        },
      });
      return { processed, created, skipped };
    }

    const dbList = [dbRecord];
    this.appLogger.structured({
      level: 'debug',
      context: DemandsPendingSyncService.name,
      type: 'SYNC_JOB',
      status: 'OK',
      message: 'Iniciando runSync',
      meta: { dataBasesCount: dbList.length },
    });

    for (const dbRecord of dbList) {
      if (!dbRecord.bases || !Array.isArray(dbRecord.bases) || dbRecord.bases.length === 0) {
        continue;
      }
      const configs = await this.portfolioCityConfigRepository.findByDataBases(dbRecord.id);
      if (configs.length === 0) {
        continue;
      }
      const idCityViews = configs.map((c) => c.id_city_views);
      const configByCityId = new Map(configs.map((c) => [c.id_city_views, c]));

      this.appLogger.structured({
        level: 'debug',
        context: DemandsPendingSyncService.name,
        type: 'SYNC_JOB',
        status: 'OK',
        message: 'Procesando registro de data_bases',
        meta: {
          dataBasesId: dbRecord.id,
          portfolio_type_id: dbRecord.portfolio_type_id,
          state_type_name: dbRecord.state_type_name,
          bases: dbRecord.bases,
          portfolioCityConfigs: configs.length,
          idCityViews,
        },
      });

      for (const baseName of dbRecord.bases) {
        try {
          // 1) Consultar primero lawsuits pendientes (status Pendiente y sin deleted_at)
          //    y cruzarlas con lawsuit_court_assignments por lawsuit_id y city_id ∈ idCityViews.
          const pendingRows = await this.fetchPendingLawSuitsWithAssignments(
            baseName,
            idCityViews,
          );
          this.appLogger.structured({
            level: 'debug',
            context: DemandsPendingSyncService.name,
            type: 'SYNC_JOB',
            status: 'OK',
            message:
              'Resultado de lawsuits pendientes con lawsuit_court_assignments por base',
            meta: {
              dataBasesId: dbRecord.id,
              baseName,
              pendingCount: pendingRows.length,
            },
          });

          for (const row of pendingRows) {
            processed++;
            const lawsuitCourtAssignmentsId = Number(
              row.lawsuit_court_assignments_id ?? row.id,
            );
            const lawsuitId = Number(row.lawsuit_id);
            const clientId = Number(
              (row.assignment_client_id as number | undefined) ??
                (row.lawsuit_client_id as number | undefined) ??
                (row.client_id as number),
            );
            const cityId = Number(row.city_id);
            const pcc = configByCityId.get(cityId);
            if (!pcc) {
              this.appLogger.structured({
                level: 'debug',
                context: DemandsPendingSyncService.name,
                type: 'SYNC_JOB',
                status: 'WARN',
                message: 'Sin configuración de ciudad para este city_id; se omite registro',
                meta: {
                  baseName,
                  dataBasesId: dbRecord.id,
                  lawsuitCourtAssignmentsId,
                  lawsuitId,
                  clientId,
                  cityId,
                },
              });
              skipped++;
              continue;
            }
            const existing = await this.managementDemandsOnlineRepository.findByLawsuitCourtAssignmentsIdAndBase(
              lawsuitCourtAssignmentsId,
              baseName,
            );
            if (existing) {
              this.appLogger.structured({
                level: 'debug',
                context: DemandsPendingSyncService.name,
                type: 'SYNC_JOB',
                status: 'OK',
                message: 'Registro ya existe en management_demands_online para esta base; se omite',
                meta: {
                  baseName,
                  dataBasesId: dbRecord.id,
                  lawsuitCourtAssignmentsId,
                  existingId: existing.id,
                },
              });
              skipped++;
              continue;
            }
            const typeQuantity =
              row.type_quantity != null ? String(row.type_quantity) : null;
            const amountType = typeQuantity
              ? await this.amountTypeRepository.findByDuplicate(typeQuantity)
              : null;
            if (!amountType) {
              this.appLogger.structured({
                level: 'debug',
                context: DemandsPendingSyncService.name,
                type: 'SYNC_JOB',
                status: 'WARN',
                message: 'No se encontró amount_type para el type_quantity; se omite',
                meta: {
                  baseName,
                  dataBasesId: dbRecord.id,
                  lawsuitCourtAssignmentsId,
                  lawsuitId,
                  typeQuantity,
                },
              });
              skipped++;
              continue;
            }
            const input: CreateManagementDemandsOnlineInput = {
              name_data_base: baseName,
              portfolio_city_config_id: pcc.id,
              campaign_id: Number(row.campaign_id ?? 0),
              lawsuit_id: lawsuitId,
              lawsuit_court_assignments_id: lawsuitCourtAssignmentsId,
              client_id: clientId,
              path_law_doc: String(row.path_law_doc ?? ''),
              lawsuit_status: String(row.lawsuit_status ?? ''),
              amount_type_id: amountType.id,
              state_type_id: DEFAULT_STATE_TYPE_ID,
              user_id: 1,
              user_name: 'BOT demands online',
              management_status: 'Abierta',
              detail: 'Demanda pendiente sincronizada por job',
              responsible: 'BOT demands online sync',
            };
            this.appLogger.structured({
              level: 'debug',
              context: DemandsPendingSyncService.name,
              type: 'SYNC_JOB',
              status: 'OK',
              message: 'Creando registro en management_demands_online',
              meta: {
                baseName,
                dataBasesId: dbRecord.id,
                lawsuitCourtAssignmentsId,
                lawsuitId,
                clientId,
                portfolio_city_config_id: pcc.id,
                amount_type_id: amountType.id,
              },
            });
            await this.managementDemandsOnlineRepository.create(input);
            created++;
          }
        } catch (err) {
          const error = err as Error;
          this.appLogger.structured({
            level: 'warn',
            context: DemandsPendingSyncService.name,
            type: 'SYNC_JOB',
            status: 'WARN',
            message: `Sync base "${baseName}" (data_bases id ${dbRecord.id}) falló`,
            meta: { error: error.message },
          });
        }
      }
    }
    return { processed, created, skipped };
  }

  /**
   * Consulta lawsuits primero (solo Pendiente y sin deleted_at) y cruza con
   * lawsuit_court_assignments por lawsuit_id, filtrando únicamente por city_id
   * incluidos en idCityViews.
   */
  private async fetchPendingLawSuitsWithAssignments(
    baseName: string,
    idCityViews: number[],
  ): Promise<Record<string, unknown>[]> {
    if (idCityViews.length === 0) return [];
    const placeholders = idCityViews.map(() => '?').join(',');
    const sql = `
      SELECT
        l.id AS lawsuit_id,
        l.client_id AS lawsuit_client_id,
        l.path_law_doc,
        l.lawsuit_status,
        l.type_quantity,
        l.user_id,
        l.user_name,
        l.campaign_id,
        lca.id AS lawsuit_court_assignments_id,
        lca.client_id AS assignment_client_id,
        lca.city_id
      FROM \`${baseName}\`.lawsuits l
      INNER JOIN \`${baseName}\`.lawsuit_court_assignments lca
        ON lca.lawsuit_id = l.id
      WHERE l.lawsuit_status = 'Pendiente'
        AND l.deleted_at IS NULL
        AND lca.city_id IN (${placeholders})
    `;
    return this.dataBasesRepository.runQueryOnBase(baseName, sql, idCityViews);
  }

  getIntervalMinutes(): number {
    const v = this.configService.get<number>('DEMANDS_PENDING_SYNC_INTERVAL_MINUTES', 30);
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : 30;
  }

  onModuleInit(): void {
    const minutes = this.getIntervalMinutes();
    const ms = minutes * 60 * 1000;
    this.intervalId = setInterval(() => this.tick(), ms);
    this.appLogger.structured({
      level: 'log',
      context: DemandsPendingSyncService.name,
      type: 'SYNC_JOB',
      status: 'OK',
      message: `Demands pending sync scheduled every ${minutes} minute(s).`,
      meta: { intervalMinutes: minutes },
    });
    setImmediate(() => this.tick());
  }

  onModuleDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async tick(): Promise<void> {
    if (!this.botControlService.isRunning()) {
      this.appLogger.structured({
        level: 'debug',
        context: DemandsPendingSyncService.name,
        type: 'SYNC_JOB',
        status: 'WARN',
        message: 'Bot detenido: no se ejecuta la sincronización de demandas pendientes.',
      });
      return;
    }
    try {
      const check = await this.botControlService.checkRuntimeConditions();
      if (!check.ok) {
        this.appLogger.structured({
          level: 'debug',
          context: DemandsPendingSyncService.name,
          type: 'SYNC_JOB',
          status: 'WARN',
          message: 'Bot no puede trabajar en este momento',
          meta: { reason: check.reason },
        });
        return;
      }
      const result = await this.runSync();
      this.appLogger.structured({
        level: 'debug',
        context: DemandsPendingSyncService.name,
        type: 'SYNC_JOB',
        status: 'OK',
        message: 'Sync done',
        meta: {
          processed: result.processed,
          created: result.created,
          skipped: result.skipped,
        },
      });
    } catch (err) {
      const error = err as Error;
      this.appLogger.structured({
        level: 'error',
        context: DemandsPendingSyncService.name,
        type: 'SYNC_JOB',
        status: 'ERROR',
        message: 'Sync failed',
        meta: { error: error.message },
        stack: error.stack,
      });
    }
  }
}
