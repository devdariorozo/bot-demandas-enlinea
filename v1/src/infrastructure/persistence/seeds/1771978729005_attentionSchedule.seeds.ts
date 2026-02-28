// Responsabilidad: insertar datos iniciales (semilla) para horarios de atención.
// Un registro con days como array de días en español.

import { DataSource } from 'typeorm';
import { AttentionScheduleEntity } from '../entities/attentionSchedule.entities';

const WEEKDAYS_ES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const attentionScheduleSeeds = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(AttentionScheduleEntity);
  const now = new Date();

  await repo.save({
    portfolio_type_id: 1, // Propias
    days: WEEKDAYS_ES,
    start_time: '08:00',
    end_time: '17:00',
    detail: 'Horario laboral estándar L-V para Propias',
    state_type_id: 1,
    created_at: now,
    updated_at: now,
    responsible: 'BOT demands online',
  });
};
