// Responsabilidad: contratos del dominio (interfaces) que la infraestructura debe implementar.

import { DataBases } from '@domain/entities/dataBases.entities';

/** Token para inyección del repositorio (las interfaces no existen en runtime en NestJS). */
export const DATABASES_REPOSITORY = Symbol('DATABASES_REPOSITORY');

/** Datos mínimos para crear un registro de bases (id y fechas son opcionales). */
export type CreateDataBasesInput = Pick<
  DataBases,
  'environment_type_id' | 'portfolio_type_id' | 'campaing_type_id' | 'bases' | 'detail' | 'state_type_id' | 'responsible'
> & Partial<DataBases>;

export interface DataBasesRepository {
  // Crear un nuevo registro de bases
  create(input: CreateDataBasesInput): Promise<DataBases>;
  // Obtener todos los registros de bases
  findAll(): Promise<DataBases[]>;
  // Obtener un registro por su id
  findById(id: number): Promise<DataBases>;
  // Actualizar un registro de bases
  update(dataBases: DataBases): Promise<DataBases>;
  // Eliminar un registro de bases
  delete(id: number): Promise<void>;
}

