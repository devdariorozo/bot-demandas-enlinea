// Responsabilidad: controlar el estado de ejecución del bot (start/stop/status)
// y validar si existen carteras activas y estamos dentro de días/horarios de atención.

import { Inject, Injectable } from '@nestjs/common';

import { DATABASES_REPOSITORY, DataBasesRepository } from '@domain/ports/dataBases.ports';
import {
  ATTENTION_SCHEDULE_REPOSITORY,
  AttentionScheduleRepository,
} from '@domain/ports/attentionSchedule.ports';
import { AppLogger } from '@infrastructure/logging/appLogger.service';

export interface BotStatus extends Record<string, unknown> {
  running: boolean;
  reason?: string;
  timestamp: string;
}

@Injectable()
export class BotControlService {
  private running = false;

  constructor(
    @Inject(DATABASES_REPOSITORY)
    private readonly dataBasesRepository: DataBasesRepository,
    @Inject(ATTENTION_SCHEDULE_REPOSITORY)
    private readonly attentionScheduleRepository: AttentionScheduleRepository,
    private readonly appLogger: AppLogger,
  ) {}

  isRunning(): boolean {
    return this.running;
  }

  async start(): Promise<BotStatus> {
    const check = await this.checkRuntimeConditions();
    if (!check.ok) {
      this.running = false;
      const status = this.buildStatus(false, check.reason);
      this.appLogger.structured({
        level: 'warn',
        context: BotControlService.name,
        type: 'BOT_STATE',
        status: 'WARN',
        message: 'Intento de iniciar el bot pero no se cumplen condiciones de ejecución',
        meta: status,
      });
      return status;
    }
    this.running = true;
    const status = this.buildStatus(true, 'Bot iniciado y listo para procesar demandas pendientes');
    this.appLogger.structured({
      level: 'log',
      context: BotControlService.name,
      type: 'BOT_STATE',
      status: 'OK',
      message: 'Bot iniciado',
      meta: status,
    });
    return status;
  }

  async stop(): Promise<BotStatus> {
    this.running = false;
    const status = this.buildStatus(false, 'Bot detenido manualmente');
    this.appLogger.structured({
      level: 'log',
      context: BotControlService.name,
      type: 'BOT_STATE',
      status: 'OK',
      message: 'Bot detenido',
      meta: status,
    });
    return status;
  }

  async status(): Promise<BotStatus> {
    const check = await this.checkRuntimeConditions();
    const reason = this.running ? check.reason : 'Bot detenido';
    const status = this.buildStatus(this.running && check.ok, reason);
    this.appLogger.structured({
      level: 'debug',
      context: BotControlService.name,
      type: 'BOT_STATE',
      status: status.running ? 'OK' : 'WARN',
      message: 'Consulta de estado del bot',
      meta: status,
    });
    return status;
  }

  /**
   * Valida si existen carteras activas y si estamos dentro de los días/horarios de atención.
   * No modifica el flag interno de running.
   */
  async checkRuntimeConditions(): Promise<{ ok: boolean; reason?: string }> {
    const now = new Date();
    const dayEs = this.getCurrentDayEs(now);
    const minutesNow = this.timeToMinutes(`${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`);

    const allBases = await this.dataBasesRepository.findAll();
    const activeBases = allBases.filter(
      (b) => b.state_type_name && b.state_type_name.toLowerCase() === 'active',
    );

    if (activeBases.length === 0) {
      return { ok: false, reason: 'No hay carteras activas para trabajar' };
    }

    const portfolioIds = Array.from(
      new Set(activeBases.map((b) => b.portfolio_type_id).filter((id) => typeof id === 'number')),
    );

    let hasValidSchedule = false;

    for (const portfolioId of portfolioIds) {
      const schedules = await this.attentionScheduleRepository.findByPortfolio(portfolioId);
      const activeSchedules = schedules.filter(
        (sc) => sc.state_type_name && sc.state_type_name.toLowerCase() === 'active',
      );
      for (const sc of activeSchedules) {
        const includesDay = Array.isArray(sc.days) && sc.days.includes(dayEs);
        if (!includesDay) continue;
        const start = this.timeToMinutes(sc.start_time);
        const end = this.timeToMinutes(sc.end_time);
        if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
        if (minutesNow >= start && minutesNow <= end) {
          hasValidSchedule = true;
          break;
        }
      }
      if (hasValidSchedule) break;
    }

    if (!hasValidSchedule) {
      return { ok: false, reason: 'No se encuentra dentro de los días u horarios de atención' };
    }

    return { ok: true };
  }

  private buildStatus(running: boolean, reason?: string): BotStatus {
    return {
      running,
      reason,
      timestamp: new Date().toISOString(),
    };
  }

  private getCurrentDayEs(date: Date): string {
    // JS: 0 = Domingo, 1 = Lunes, ...
    const daysEs = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return daysEs[date.getDay()] ?? 'Lunes';
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}

