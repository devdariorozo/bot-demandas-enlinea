// Responsabilidad: contratos del dominio (interfaces) que la infraestructura debe implementar.

import { SpecialtyProcess } from '@domain/entities/specialtyProcess.entities';

/** Token para inyección del repositorio (las interfaces no existen en runtime en NestJS). */
export const SPECIALTY_PROCESS_REPOSITORY = Symbol('SPECIALTY_PROCESS_REPOSITORY');

/** Datos mínimos para crear una especialidad de proceso (id y fechas son opcionales). */
export type CreateSpecialtyProcessInput = Pick<
  SpecialtyProcess,
  'type' | 'detail' | 'state_type_id' | 'responsible'
> &
  Partial<SpecialtyProcess>;

export interface SpecialtyProcessRepository {
  // Crear una nueva especialidad de proceso
  create(input: CreateSpecialtyProcessInput): Promise<SpecialtyProcess>;
  // Buscar si existe una especialidad ACTIVA con el mismo type
  findActiveDuplicate(type: string): Promise<SpecialtyProcess | null>;
  // Obtener todas las especialidades
  findAll(): Promise<SpecialtyProcess[]>;
  // Obtener una especialidad por su id
  findById(id: number): Promise<SpecialtyProcess>;
  // Obtener una especialidad por su type (independiente del estado)
  findByType(type: string): Promise<SpecialtyProcess>;
  // Actualizar una especialidad
  update(specialty: SpecialtyProcess): Promise<SpecialtyProcess>;
  // Eliminar una especialidad
  delete(id: number): Promise<void>;
}

