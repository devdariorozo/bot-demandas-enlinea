// Responsabilidad: orquestar la ejecución de todas las seeds.

import { dataSource } from '../data_source';
import { stateTypeSeeds } from './1771978729006_stateType.seeds';
import { portfolioTypeSeeds } from './1771978729007_portfolioType.seeds';

async function runSeeds() {
  try {
    await dataSource.initialize();

    const qr = dataSource.createQueryRunner();
    await qr.connect();
    try {
      await qr.query('SET FOREIGN_KEY_CHECKS = 0');
      await qr.query('TRUNCATE TABLE portfolio_type');
      await qr.query('TRUNCATE TABLE state_type');
      await qr.query('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
      await qr.release();
    }

    await stateTypeSeeds(dataSource);
    await portfolioTypeSeeds(dataSource);
  } catch (error) {
    console.error('Error ejecutando seeds:', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();