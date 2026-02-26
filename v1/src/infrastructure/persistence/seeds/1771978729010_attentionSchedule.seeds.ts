// Responsabilidad: insertar datos iniciales (semilla) para horarios de atención.

import { DataSource } from 'typeorm';
import { AttentionScheduleEntity } from '../entities/attentionSchedule.entities';

export const attentionScheduleSeeds = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(AttentionScheduleEntity);
  const now = new Date();

  await repo.save([
    {
      portfolio_type_id: 1, // Propias
      campaing_type_id: 1, // Claro
      day_of_week: 'Lunes',
      shiftType: 'continua',
      start_time: '08:00',
      end_time: '17:00',
      detail: 'Horario continuo de 8 a 17 para Propias / Claro',
      state_type_id: 1, // Active
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      portfolio_type_id: 1, // Propias
      campaing_type_id: 1, // Claro
      day_of_week: 'Martes',
      shiftType: 'partida',
      start_time: '08:00',
      end_time: '12:00',
      detail: 'Horario partido mañana para Propias / Claro',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      portfolio_type_id: 1, // Propias
      campaing_type_id: 1, // Claro
      day_of_week: 'Martes',
      shiftType: 'partida',
      start_time: '14:00',
      end_time: '18:00',
      detail: 'Horario partido tarde para Propias / Claro',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
  ]);
};

