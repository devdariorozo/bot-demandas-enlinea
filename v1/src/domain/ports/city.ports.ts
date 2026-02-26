// Responsabilidad: contratos del dominio (interfaces) que la infraestructura debe implementar.

import { City } from '@domain/entities/city.entities';

/** Token para inyección del repositorio (las interfaces no existen en runtime en NestJS). */
export const CITY_REPOSITORY = Symbol('CITY_REPOSITORY');

/** Datos mínimos para crear una ciudad (id y fechas son opcionales). */
export type CreateCityInput = Pick<City, 'name' | 'detail' | 'departament_id' | 'state_type_id' | 'responsible'> & Partial<City>;

export interface CityRepository {
  // Crear una nueva ciudad
  create(input: CreateCityInput): Promise<City>;
  // Buscar si la ciudad ya existe en el mismo departamento
  findByDuplicate(name: string, departament_id: number): Promise<City | null>;
  // Obtener todas las ciudades
  findAll(): Promise<City[]>;
  // Obtener una ciudad por su id
  findById(id: number): Promise<City>;
  // Obtener ciudades por departamento
  findByDepartament(departament_id: number): Promise<City[]>;
  // Actualizar una ciudad
  update(city: City): Promise<City>;
  // Eliminar una ciudad
  delete(id: number): Promise<void>;
}

