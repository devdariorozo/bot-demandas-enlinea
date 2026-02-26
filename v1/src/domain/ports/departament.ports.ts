// Responsabilidad: contratos del dominio (interfaces) que la infraestructura debe implementar.

import { Departament } from '@domain/entities/departament.entities';

/** Token para inyección del repositorio (las interfaces no existen en runtime en NestJS). */
export const DEPARTAMENT_REPOSITORY = Symbol('DEPARTAMENT_REPOSITORY');

/** Datos mínimos para crear un departamento (id y fechas son opcionales). */
export type CreateDepartamentInput = Pick<Departament, 'name' | 'detail' | 'state_type_id' | 'responsible'> & Partial<Departament>;

export interface DepartamentRepository {
  // Crear un nuevo departamento
  create(input: CreateDepartamentInput): Promise<Departament>;
  // Buscar si el departamento ya existe
  findByDuplicate(name: string): Promise<Departament | null>;
  // Obtener todos los departamentos
  findAll(): Promise<Departament[]>;
  // Obtener un departamento por su id
  findById(id: number): Promise<Departament>;
  // Obtener un departamento por su nombre
  findByName(name: string): Promise<Departament>;
  // Actualizar un departamento
  update(departament: Departament): Promise<Departament>;
  // Eliminar un departamento
  delete(id: number): Promise<void>;
}

