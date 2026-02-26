// Responsabilidad: insertar datos iniciales (semilla) para departamentos.

import { DataSource } from 'typeorm';
import { DepartamentEntity } from '../entities/departament.entities';

export const departamentSeeds = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(DepartamentEntity);
  const now = new Date();

  await repo.save([
    {
      name: 'ARAUCA',
      detail: 'Departamento de Arauca registrado',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      name: 'ATLANTICO',
      detail: 'Departamento de Atlántico registrado',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      name: 'BOGOTA',
      detail: 'Departamento de Bogotá registrado',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      name: 'BOLIVAR',
      detail: 'Departamento de Bolívar registrado',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      name: 'NORTE DE SANTANDER',
      detail: 'Departamento de Norte de Santander registrado',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      name: 'TOLIMA',
      detail: 'Departamento de Tolima registrado',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
  ]);
};

