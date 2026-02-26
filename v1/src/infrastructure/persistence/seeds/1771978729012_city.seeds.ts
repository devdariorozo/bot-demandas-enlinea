// Responsabilidad: insertar datos iniciales (semilla) para ciudades.

import { DataSource } from 'typeorm';
import { CityEntity } from '../entities/city.entities';

export const citySeeds = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(CityEntity);
  const now = new Date();

  await repo.save([
    // Departamento 1: ARAUCA
    {
      departament_id: 1,
      name: 'ARAUCA',
      detail: 'Ciudad de Arauca registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      departament_id: 1,
      name: 'SARAVENA',
      detail: 'Ciudad de Saravena registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      departament_id: 1,
      name: 'TAME',
      detail: 'Ciudad de Tame registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },

    // Departamento 2: ATLANTICO
    {
      departament_id: 2,
      name: 'BARRANQUILLA',
      detail: 'Ciudad de Barranquilla registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      departament_id: 2,
      name: 'SABANALARGA',
      detail: 'Ciudad de Sabanalarga registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      departament_id: 2,
      name: 'SOLEDAD',
      detail: 'Ciudad de Soledad registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },

    // Departamento 3: BOGOTA
    {
      departament_id: 3,
      name: 'BOGOTA D.C',
      detail: 'Ciudad de Bogotá D.C registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },

    // Departamento 4: BOLIVAR
    { departament_id: 4, name: 'ACHI', detail: 'Ciudad de Achi registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'ALTOS DEL ROSARIO', detail: 'Ciudad de Altos Del Rosario registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'ARENAL', detail: 'Ciudad de Arenal registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'ARJONA', detail: 'Ciudad de Arjona registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'ARROYOHONDO', detail: 'Ciudad de Arroyohondo registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'BARRANCO DE LOBA', detail: 'Ciudad de Barranco De Loba registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'CALAMAR', detail: 'Ciudad de Calamar registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'CANTAGALLO', detail: 'Ciudad de Cantagallo registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'CARTAGENA', detail: 'Ciudad de Cartagena registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'CICUCO', detail: 'Ciudad de Cicuco registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'CLEMENCIA', detail: 'Ciudad de Clemencia registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'CORDOBA', detail: 'Ciudad de Cordoba registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'EL CARMEN DE BOLIVAR', detail: 'Ciudad de El Carmen De Bolivar registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'EL GUAMO', detail: 'Ciudad de El Guamo registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'EL PEÑON', detail: 'Ciudad de El Peñon registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'HATILLO DE LOBA', detail: 'Ciudad de Hatillo De Loba registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'MAGANGUE', detail: 'Ciudad de Magangue registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'MAHATES', detail: 'Ciudad de Mahates registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'MARGARITA', detail: 'Ciudad de Margarita registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'MARIA LA BAJA', detail: 'Ciudad de Maria La Baja registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'MOMPOS', detail: 'Ciudad de Mompos registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'MONTECRISTO', detail: 'Ciudad de Montecristo registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'MORALES', detail: 'Ciudad de Morales registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'NOROSI', detail: 'Ciudad de Norosi registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'PINILLOS', detail: 'Ciudad de Pinillos registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'REGIDOR', detail: 'Ciudad de Regidor registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'RIO VIEJO', detail: 'Ciudad de Rio Viejo registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'SAN CRISTOBAL', detail: 'Ciudad de San Cristobal registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'SAN ESTANISLAO', detail: 'Ciudad de San Estanislao registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'SAN FERNANDO', detail: 'Ciudad de San Fernando registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'SAN JACINTO', detail: 'Ciudad de San Jacinto registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'SAN JACINTO DEL CAUCA', detail: 'Ciudad de San Jacinto Del Cauca registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'SAN JUAN NEPOMUCENO', detail: 'Ciudad de San Juan Nepomuceno registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'SAN MARTIN DE LOBA', detail: 'Ciudad de San Martin De Loba registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'SAN PABLO', detail: 'Ciudad de San Pablo registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'SANTA CATALINA', detail: 'Ciudad de Santa Catalina registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'SANTA ROSA', detail: 'Ciudad de Santa Rosa registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'SANTA ROSA DEL SUR', detail: 'Ciudad de Santa Rosa Del Sur registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'SIMITI', detail: 'Ciudad de Simiti registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'SOPLAVIENTO', detail: 'Ciudad de Soplaviento registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'TALAIGUA NUEVO', detail: 'Ciudad de Talaigua Nuevo registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'TIQUISIO', detail: 'Ciudad de Tiquisio registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'TURBACO', detail: 'Ciudad de Turbaco registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'TURBANA', detail: 'Ciudad de Turbana registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'VILLANUEVA', detail: 'Ciudad de Villanueva registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },
    { departament_id: 4, name: 'ZAMBRANO', detail: 'Ciudad de Zambrano registrada', state_type_id: 1, created_at: now, updated_at: now, responsible: 'BOT demands online' },

    // Departamento 5: NORTE DE SANTANDER (el usuario lo llamó Cesar en la lista)
    {
      departament_id: 5,
      name: 'CUCUTA',
      detail: 'Ciudad de Cucuta registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      departament_id: 5,
      name: 'LOS PATIOS',
      detail: 'Ciudad de Los Patios registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      departament_id: 5,
      name: 'OCAÑA',
      detail: 'Ciudad de Ocaña registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      departament_id: 5,
      name: 'PAMPLONA',
      detail: 'Ciudad de Pamplona registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      departament_id: 5,
      name: 'VILLA DEL ROSARIO',
      detail: 'Ciudad de Villa Del Rosario registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },

    // Departamento 6: TOLIMA
    {
      departament_id: 6,
      name: 'IBAGUE',
      detail: 'Ciudad de Ibague registrada',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
  ]);
};

