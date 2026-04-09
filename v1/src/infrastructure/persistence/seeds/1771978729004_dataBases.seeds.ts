// Responsabilidad: insertar datos iniciales (semilla) para data_bases.

import { DataSource } from 'typeorm';
import { DataBasesEntity } from '../entities/dataBases.entities';

// Listado completo de bases para cartera propia (producción)
const CARTERA_PROPIA_BASES = [
  'miosv2_banco_bogota_2024',
  'miosv2_banco_bogota_2025',
  'miosv2_banco_nu',
  'miosv2_cartera_popular',
  'miosv2_carteras',
  'miosv2_falabella_2020',
  'miosv2_falabella_2021',
  'miosv2_falabella_2023',
  'miosv2_falabella_2024',
  'miosv2_popular_2020',
  'miosv2_popular_2021',
  'miosv2_serfinanza_2023',
  'miosv2_serfinanza_2024',
  'miosv2_serfinanza_2025',
  'miosv2_serfinanza_2025_2',
  'miosv2_tuya_2022',
  'miosv2_tuya_agosto_2022',
  'miosv2_tuya_jud_2021',
  'miosv2_tuya_medellin_2021',
  'miosv2_tuya_medellin_jud_2022',
  'miosv2_tuya_serfinanza_2022',
  'miosv2_bbva_2025',
];

// Bases reducidas para entornos no productivos (dev, docker, qa)
const BASES_PROPIAS_NO_PRO = ['miosv2_carteras_QA', 'miosv2_cartera_mirror'];

export const dataBasesSeeds = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(DataBasesEntity);
  const now = new Date();

  await repo.save([
    // Primero cartera 1 ordenada por ambientes 1,2,3,4
    // Ambientes 1, 2, 3 (dev, docker, qa) — portfolio 1: solo miosv2_carteras_QA y miosv2_cartera_mirror
    {
      environment_type_id: 1, // dev
      portfolio_type_id: 1,
      bases: BASES_PROPIAS_NO_PRO,
      detail: 'Listado base de datos correspondiente a la cartera propia',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      environment_type_id: 2, // docker
      portfolio_type_id: 1,
      bases: BASES_PROPIAS_NO_PRO,
      detail: 'Listado base de datos correspondiente a la cartera propia',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      environment_type_id: 3, // qa
      portfolio_type_id: 1,
      bases: BASES_PROPIAS_NO_PRO,
      detail: 'Listado base de datos correspondiente a la cartera propia',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    // Ambiente 4 (pro) — portfolio 1: listado completo de cartera propia
    {
      environment_type_id: 4, // pro
      portfolio_type_id: 1,
      bases: CARTERA_PROPIA_BASES,
      detail: 'Listado base de datos correspondiente a la cartera propia',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },

    // Luego cartera 2 ordenada por ambientes 1,2,3,4
    // Ambientes 1, 2, 3 — portfolio 2: Sudameris QA
    {
      environment_type_id: 1,
      portfolio_type_id: 2,
      bases: ['miosv2_cartera_sudameris_qa'],
      detail: 'Listado base de datos correspondiente a la cartera sudameris',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      environment_type_id: 2,
      portfolio_type_id: 2,
      bases: ['miosv2_cartera_sudameris_qa'],
      detail: 'Listado base de datos correspondiente a la cartera sudameris',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    {
      environment_type_id: 3,
      portfolio_type_id: 2,
      bases: ['miosv2_cartera_sudameris_qa'],
      detail: 'Listado base de datos correspondiente a la cartera sudameris',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
    // Ambiente 4 (pro) — portfolio 2: dos bases
    {
      environment_type_id: 4,
      portfolio_type_id: 2,
      bases: ['ejemplo1', 'ejemplo2'],
      detail: 'Listado base de datos correspondiente a la cartera sudameris',
      state_type_id: 1,
      created_at: now,
      updated_at: now,
      responsible: 'BOT demands online',
    },
  ]);
};

