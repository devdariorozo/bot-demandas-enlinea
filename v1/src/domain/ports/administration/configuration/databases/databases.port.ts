/**
 * Port para la persistencia de la configuración de bases de datos.
 * Capa de dominio: no conoce TypeORM ni detalles de infraestructura.
 */

import { ConfigDataBases } from '../../../../entities/administration/configuration/databases/databases.interface';

export interface ConfigDataBasesRepositoryPort {
  create(entity: Partial<ConfigDataBases>): Promise<ConfigDataBases>;
  findByNaturalKey(
    environment: string,
    portfolio_type: string,
    campaign?: string | null,
  ): Promise<ConfigDataBases | null>;
  findAll(filters?: {
    environment?: string;
    portfolio_type?: string;
    campaign?: string;
    state_type?: number;
  }): Promise<ConfigDataBases[]>;
  findById(id: number): Promise<ConfigDataBases | null>;
  update(
    id: number,
    entity: Partial<ConfigDataBases>,
  ): Promise<ConfigDataBases>;
  delete(id: number): Promise<void>;
  findDistinctEnvironments(): Promise<string[]>;
  findDistinctPortfolioTypes(): Promise<string[]>;
  findDistinctCampaigns(): Promise<string[]>;
  findDistinctStateTypes(): Promise<{ value: number; label: string }[]>;
}

export const CONFIG_DATA_BASES_REPOSITORY = Symbol(
  'CONFIG_DATA_BASES_REPOSITORY',
);
