// Responsabilidad: insertar datos iniciales (semilla) para portfolio_city_config.

import { DataSource } from 'typeorm';
import { PortfolioCityConfigEntity } from '../entities/portfolioCityConfig.entities';

/**
 * Vista de ciudad de ejemplo: id=149, city_name=BOGOTÁ, department=BOGOTÁ, city=BOGOTÁ - BOGOTÁ.
 * data_bases seeds: 1=dev propias, 2=docker propias, 3=qa propias, 4=pro propias,
 *                  5=dev sudameris, 6=docker sudameris, 7=qa sudameris, 8=pro sudameris.
 */
export const portfolioCityConfigSeeds = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(PortfolioCityConfigEntity);
  const now = new Date();

  const idCityViews = 149;
  const nameDepartament = 'BOGOTÁ';
  const nameCity = 'BOGOTÁ';
  const city = 'BOGOTÁ - BOGOTÁ';

  await repo.save([
    // Carteras propias: dev (id_data_bases=1), docker (2), qa (3), pro (4)
    {
      id_data_bases: 1,
      id_city_views: idCityViews,
      name_departament: nameDepartament,
      name_city: nameCity,
      city,
      detail: 'Configuración cartera propia - Bogotá (dev)',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      id_data_bases: 2,
      id_city_views: idCityViews,
      name_departament: nameDepartament,
      name_city: nameCity,
      city,
      detail: 'Configuración cartera propia - Bogotá (docker)',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      id_data_bases: 3,
      id_city_views: idCityViews,
      name_departament: nameDepartament,
      name_city: nameCity,
      city,
      detail: 'Configuración cartera propia - Bogotá (qa)',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      id_data_bases: 4,
      id_city_views: idCityViews,
      name_departament: nameDepartament,
      name_city: nameCity,
      city,
      detail: 'Configuración cartera propia - Bogotá (pro)',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    // Sudameris: dev (5), docker (6), qa (7), pro (8)
    {
      id_data_bases: 5,
      id_city_views: idCityViews,
      name_departament: nameDepartament,
      name_city: nameCity,
      city,
      detail: 'Configuración cartera Sudameris - Bogotá (dev)',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      id_data_bases: 6,
      id_city_views: idCityViews,
      name_departament: nameDepartament,
      name_city: nameCity,
      city,
      detail: 'Configuración cartera Sudameris - Bogotá (docker)',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      id_data_bases: 7,
      id_city_views: idCityViews,
      name_departament: nameDepartament,
      name_city: nameCity,
      city,
      detail: 'Configuración cartera Sudameris - Bogotá (qa)',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      id_data_bases: 8,
      id_city_views: idCityViews,
      name_departament: nameDepartament,
      name_city: nameCity,
      city,
      detail: 'Configuración cartera Sudameris - Bogotá (pro)',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
  ]);
};
