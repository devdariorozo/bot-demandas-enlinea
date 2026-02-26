// Responsabilidad: contratos del dominio (interfaces) que la infraestructura debe implementar.

import { ClassProcessConfig } from '@domain/entities/classProcessConfig.entities';

/** Token para inyección del repositorio (las interfaces no existen en runtime en NestJS). */
export const CLASS_PROCESS_CONFIG_REPOSITORY = Symbol('CLASS_PROCESS_CONFIG_REPOSITORY');

/** Datos mínimos para crear un registro de configuración (id y fechas son opcionales). */
export type CreateClassProcessConfigInput = Pick<
  ClassProcessConfig,
  'portfolio_type_id' | 'campaing_type_id' | 'class_process_ids' | 'detail' | 'state_type_id' | 'responsible'
> & Partial<ClassProcessConfig>;

export interface ClassProcessConfigRepository {
  create(input: CreateClassProcessConfigInput): Promise<ClassProcessConfig>;
  findAll(): Promise<ClassProcessConfig[]>;
  findById(id: number): Promise<ClassProcessConfig>;
  findByPortfolioAndCampaing(portfolio_type_id: number, campaing_type_id: number): Promise<ClassProcessConfig[]>;
  update(config: ClassProcessConfig): Promise<ClassProcessConfig>;
  delete(id: number): Promise<void>;
}
