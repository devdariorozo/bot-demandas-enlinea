// Responsabilidad: insertar datos iniciales (semilla) para clases de proceso.

import { DataSource } from 'typeorm';
import { ClassProcessEntity } from '../entities/classProcess.entities';

export const classProcessSeeds = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(ClassProcessEntity);
  const now = new Date();

  await repo.save([
    // Especialidad id 1: ejemplo 1
    {
      specialty_process_id: 1,
      type: 'ejemplo 1',
      detail: 'Ejemplo 1',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    // Especialidad id 2: ejemplo 2
    {
      specialty_process_id: 2,
      type: 'ejemplo 2',
      detail: 'Ejemplo 2',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    // Especialidad id 3: solo MONITORIO y EJECUTIVO DE MÍNIMA CUANTÍA
    {
      specialty_process_id: 3,
      type: '41-03-02 MONITORIO',
      detail: 'Monitorio registrado',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      specialty_process_id: 3,
      type: '41-03-08 EJECUTIVO DE MÍNIMA CUANTÍA',
      detail: 'Ejecutivo de mínima cuantía registrado',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
  ]);
};
