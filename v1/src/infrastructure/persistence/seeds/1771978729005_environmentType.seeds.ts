// Responsabilidad: insertar datos iniciales (semilla) para tipos de entorno.

import { DataSource } from 'typeorm';
import { EnvironmentTypeEntity } from '../entities/environmentType.entities';

export const environmentTypeSeeds = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(EnvironmentTypeEntity);
  const now = new Date();
  await repo.save([
    {
      type: 'dev',
      detail: 'Dev environment registered',
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      type: 'qa',
      detail: 'QA environment registered',
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      type: 'pro',
      detail: 'Production environment registered',
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
  ]);
};

