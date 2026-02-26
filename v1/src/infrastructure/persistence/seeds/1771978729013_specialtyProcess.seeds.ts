// Responsabilidad: insertar datos iniciales (semilla) para especialidades de proceso.

import { DataSource } from 'typeorm';
import { SpecialtyProcessEntity } from '../entities/specialtyProcess.entities';

export const specialtyProcessSeeds = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(SpecialtyProcessEntity);
  const now = new Date();

  await repo.save([
    {
      type: 'CIVIL CIRCUITO - MAYOR CUANTÍA',
      detail: 'Especialidad civil circuito mayor cuantía registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      type: 'CIVIL MUNICIPAL - MENOR CUANTÍA',
      detail: 'Especialidad civil municipal menor cuantía registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      type: 'CIVIL MUNICIPAL DE PEQUEÑAS CAUSAS Y COMPETENCIA MÚLTIPLE – MÍNIMA CUANTÍA',
      detail: 'Especialidad civil municipal pequeñas causas y competencia múltiple mínima cuantía registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
  ]);
};

