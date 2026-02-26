// Responsabilidad: contratos del dominio (interfaces) que la infraestructura debe implementar.

import { ClassProcess } from '@domain/entities/classProcess.entities';

/** Token para inyección del repositorio (las interfaces no existen en runtime en NestJS). */
export const CLASS_PROCESS_REPOSITORY = Symbol('CLASS_PROCESS_REPOSITORY');

/** Datos mínimos para crear una clase de proceso (id y fechas son opcionales). */
export type CreateClassProcessInput = Pick<
  ClassProcess,
  'specialty_process_id' | 'type' | 'detail' | 'state_type_id' | 'responsible'
> &
  Partial<ClassProcess>;

export interface ClassProcessRepository {
  create(input: CreateClassProcessInput): Promise<ClassProcess>;
  /** Duplicado activo: mismo type y misma especialidad en estado activo. */
  findActiveDuplicate(specialtyProcessId: number, type: string, excludeId?: number): Promise<ClassProcess | null>;
  findAll(): Promise<ClassProcess[]>;
  findById(id: number): Promise<ClassProcess>;
  /** Catálogo por especialidad (para otros módulos). */
  findBySpecialtyId(specialtyProcessId: number): Promise<ClassProcess[]>;
  update(classProcess: ClassProcess): Promise<ClassProcess>;
  delete(id: number): Promise<void>;
}
