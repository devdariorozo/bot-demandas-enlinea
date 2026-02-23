/**
 * Runner de seeds: ejecuta los seeds de las carpetas secundarias
 * (administration/configuration/databases, etc.).
 *
 * Uso: npm run seed:run
 * Requiere .env con DB_CONFIG_* apuntando a la BD (ej. bot_demandas_online).
 */
import { config } from 'dotenv';
import dataSource from '../data-source';
import { runConfigDataBasesSeeds } from './administration/configuration/databases/1739966400000_config_data_bases.seeds';

config({ path: '.env' });

async function run(): Promise<void> {
  await dataSource.initialize();
  try {
    await runConfigDataBasesSeeds(dataSource);
    console.log('[seed] Done.');
  } finally {
    await dataSource.destroy();
  }
}

run().catch((err) => {
  console.error('[seed] Error:', err);
  process.exit(1);
});
