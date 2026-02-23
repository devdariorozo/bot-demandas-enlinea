//===============================================================
// Port para la persistencia de la configuración de carteras
//===============================================================

import { ConfigPortfolios } from '../../../../entities/administration/configuration/portfolios/portfolios.interface';

export interface ConfigPortfoliosRepositoryPort {
  create(entity: Partial<ConfigPortfolios>): Promise<ConfigPortfolios>;// Crear una nueva cartera
  findByNaturalKey(id: number): Promise<ConfigPortfolios | null>;// Buscar una cartera por su ID
  findAll(): Promise<ConfigPortfolios[]>;// Buscar todas las carteras
  update(id: number, entity: Partial<ConfigPortfolios>): Promise<ConfigPortfolios>;// Actualizar una cartera
  delete(id: number): Promise<void>;// Eliminar una cartera
  findDistinctPortfolioTypes(): Promise<string[]>;// Buscar todos los tipos de cartera
  findDistinctStateTypes(): Promise<{ value: number; label: string }[]>;// Buscar todos los estados de cartera
}

export const CONFIG_PORTFOLIOS_REPOSITORY = Symbol(
  'CONFIG_PORTFOLIOS_REPOSITORY',
);