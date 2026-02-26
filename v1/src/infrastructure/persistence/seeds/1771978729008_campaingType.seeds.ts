// Responsabilidad: insertar datos iniciales (semilla) para tipos de campaña.

import { DataSource } from 'typeorm';
import { CampaingTypeEntity } from '../entities/campaingType.entities';

export const campaingTypeSeeds = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(CampaingTypeEntity);
  const now = new Date();
  await repo.save([
    {
      type: 'Claro',
      detail: 'Claro registered',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      type: 'Tuya',
      detail: 'Tuya registered',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
  ]);
};