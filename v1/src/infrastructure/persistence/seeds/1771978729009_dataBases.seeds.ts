// Responsabilidad: insertar datos iniciales (semilla) para data_bases.

import { DataSource } from 'typeorm';
import { DataBasesEntity } from '../entities/dataBases.entities';

export const dataBasesSeeds = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(DataBasesEntity);
  const now = new Date();

  await repo.save([
    {
      environment_type_id: 1, // dev
      portfolio_type_id: 1, // Propias
      campaing_type_id: 1, // Claro
      bases: ['dev_db_1', 'dev_db_2', 'dev_db_3'],
      detail: 'Bases de datos para entorno dev, cartera Propias, campaña Claro',
      state_type_id: 1, // Active
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      environment_type_id: 2, // qa
      portfolio_type_id: 1, // Propias
      campaing_type_id: 1, // Claro
      bases: ['qa_db_1', 'qa_db_2'],
      detail: 'Bases de datos para entorno qa, cartera Propias, campaña Claro',
      state_type_id: 1, // Active
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      environment_type_id: 3, // pro
      portfolio_type_id: 1, // Propias
      campaing_type_id: 1, // Claro
      bases: ['pro_db_1'],
      detail: 'Bases de datos para entorno pro, cartera Propias, campaña Claro',
      state_type_id: 1, // Active
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
  ]);
};

