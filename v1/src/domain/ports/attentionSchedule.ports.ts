// Responsabilidad: contratos del dominio (interfaces) que la infraestructura debe implementar.

import { AttentionSchedule } from '@domain/entities/attentionSchedule.entities';

/** Token para inyección del repositorio (las interfaces no existen en runtime en NestJS). */
export const ATTENTION_SCHEDULE_REPOSITORY = Symbol('ATTENTION_SCHEDULE_REPOSITORY');

/** Datos mínimos para crear un horario de atención (id y fechas son opcionales). */
export type CreateAttentionScheduleInput = Pick<
  AttentionSchedule,
  'portfolio_type_id' | 'campaing_type_id' | 'day_of_week' | 'shiftType' | 'start_time' | 'end_time' | 'detail' | 'state_type_id' | 'responsible'
> & Partial<AttentionSchedule>;

export interface AttentionScheduleRepository {
  // Crear un nuevo horario
  create(input: CreateAttentionScheduleInput): Promise<AttentionSchedule>;
  // Obtener todos los horarios
  findAll(): Promise<AttentionSchedule[]>;
  // Obtener un horario por su id
  findById(id: number): Promise<AttentionSchedule>;
  // Obtener todos los horarios para una combinación cartera/campaña y día
  findByPortfolioCampaingAndDay(
    portfolio_type_id: number,
    campaing_type_id: number,
    day_of_week: string,
  ): Promise<AttentionSchedule[]>;
  // Actualizar un horario
  update(attentionSchedule: AttentionSchedule): Promise<AttentionSchedule>;
  // Eliminar un horario
  delete(id: number): Promise<void>;
}

