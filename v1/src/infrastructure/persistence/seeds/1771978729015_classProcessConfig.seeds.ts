// Responsabilidad: insertar datos iniciales (semilla) para configuración cartera+campaña+clases de proceso.

import { DataSource } from 'typeorm';
import { ClassProcessConfigEntity } from '../entities/classProcessConfig.entities';

export const classProcessConfigSeeds = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(ClassProcessConfigEntity);
  const now = new Date();

  await repo.save([
    // Primera cartera (Propias id=1) + primera campaña (Claro id=1) con clase de proceso id 4
    {
      portfolio_type_id: 1,
      campaing_type_id: 1,
      class_process_ids: [4],
      detail: 'Config Propias + Claro: clase de proceso 4',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    // Segunda cartera (Sudameris id=2) + segunda campaña (Tuya id=2) con clase de proceso id 4
    {
      portfolio_type_id: 2,
      campaing_type_id: 2,
      class_process_ids: [4],
      detail: 'Config Sudameris + Tuya: clase de proceso 4',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
  ]);
};
