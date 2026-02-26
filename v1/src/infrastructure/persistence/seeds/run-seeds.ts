// Responsabilidad: orquestar la ejecución de todas las seeds.

import { dataSource } from '../data_source';
import { environmentTypeSeeds } from './1771978729005_environmentType.seeds';
import { stateTypeSeeds } from './1771978729006_stateType.seeds';
import { portfolioTypeSeeds } from './1771978729007_portfolioType.seeds';
import { campaingTypeSeeds } from './1771978729008_campaingType.seeds';
import { dataBasesSeeds } from './1771978729009_dataBases.seeds';
import { attentionScheduleSeeds } from './1771978729010_attentionSchedule.seeds';
import { departamentSeeds } from './1771978729011_departament.seeds';
import { citySeeds } from './1771978729012_city.seeds';
import { specialtyProcessSeeds } from './1771978729013_specialtyProcess.seeds';
import { classProcessSeeds } from './1771978729014_classProcess.seeds';
import { classProcessConfigSeeds } from './1771978729015_classProcessConfig.seeds';

async function runSeeds() {
  try {
    await dataSource.initialize();

    const qr = dataSource.createQueryRunner();
    await qr.connect();
    try {
      await qr.query('SET FOREIGN_KEY_CHECKS = 0');
      await qr.query('TRUNCATE TABLE environment_type');
      await qr.query('TRUNCATE TABLE state_type');
      await qr.query('TRUNCATE TABLE portfolio_type');
      await qr.query('TRUNCATE TABLE campaing_type');
      await qr.query('TRUNCATE TABLE data_bases');
      await qr.query('TRUNCATE TABLE attention_schedule');
      await qr.query('TRUNCATE TABLE departament');
      await qr.query('TRUNCATE TABLE city');
      await qr.query('TRUNCATE TABLE specialty_process');
      await qr.query('TRUNCATE TABLE class_process');
      await qr.query('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
      await qr.release();
    }

    await environmentTypeSeeds(dataSource);
    await stateTypeSeeds(dataSource);
    await portfolioTypeSeeds(dataSource);
    await campaingTypeSeeds(dataSource);
    await dataBasesSeeds(dataSource);
    await attentionScheduleSeeds(dataSource);
    await departamentSeeds(dataSource);
    await citySeeds(dataSource);
    await specialtyProcessSeeds(dataSource);
    await classProcessSeeds(dataSource);
    await classProcessConfigSeeds(dataSource);
  } catch (error) {
    console.error('Error ejecutando seeds:', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();