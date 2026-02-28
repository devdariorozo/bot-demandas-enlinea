// Responsabilidad: orquestar la ejecución de todas las seeds.

import { dataSource } from '../data_source';
import { environmentTypeSeeds } from './1771978729001_environmentType.seeds';
import { stateTypeSeeds } from './1771978729002_stateType.seeds';
import { portfolioTypeSeeds } from './1771978729003_portfolioType.seeds';
import { dataBasesSeeds } from './1771978729004_dataBases.seeds';
import { attentionScheduleSeeds } from './1771978729005_attentionSchedule.seeds';
import { portfolioCityConfigSeeds } from './1771978729006_portfolioCityConfig.seeds';

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
      await qr.query('TRUNCATE TABLE data_bases');
      await qr.query('TRUNCATE TABLE attention_schedule');
      await qr.query('TRUNCATE TABLE portfolio_city_config');
      await qr.query('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
      await qr.release();
    }

    await environmentTypeSeeds(dataSource);
    await stateTypeSeeds(dataSource);
    await portfolioTypeSeeds(dataSource);
    await dataBasesSeeds(dataSource);
    await attentionScheduleSeeds(dataSource);
    await portfolioCityConfigSeeds(dataSource);
  } catch (error) {
    console.error('Error ejecutando seeds:', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();