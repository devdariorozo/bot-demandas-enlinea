/**
 * Standalone seed script. Idempotent: skips insert if row exists for (environment, portfolio_type, campaign).
 *
 * Usage: npm run seed:run
 *
 * Requires .env with DB_CONFIG_* pointing to bot_demandas_online (or DB_CONFIG_DATABASE).
 */
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config({ path: '.env' });

const RESPONSIBLE = 'BOT Demandas En Linea';

const seeds = [
  { environment: 'dev', portfolio_type: 'propias', campaign: 'tuya', data_bases: ['demandas_propias_dev_tuya_1', 'demandas_propias_dev_tuya_2', 'demandas_propias_dev_tuya_3'], detail: 'Carteras Propias – dev – tuya (3 databases)', state_type: 1, responsible: RESPONSIBLE },
  { environment: 'dev', portfolio_type: 'propias', campaign: 'laika', data_bases: ['demandas_propias_dev_laika_1', 'demandas_propias_dev_laika_2', 'demandas_propias_dev_laika_3'], detail: 'Carteras Propias – dev – laika (3 databases)', state_type: 1, responsible: RESPONSIBLE },
  { environment: 'dev', portfolio_type: 'propias', campaign: 'claro', data_bases: ['demandas_propias_dev_claro_1', 'demandas_propias_dev_claro_2', 'demandas_propias_dev_claro_3'], detail: 'Carteras Propias – dev – claro (3 databases)', state_type: 1, responsible: RESPONSIBLE },
  { environment: 'qa', portfolio_type: 'propias', campaign: 'tuya', data_bases: ['demandas_propias_qa_tuya_1', 'demandas_propias_qa_tuya_2', 'demandas_propias_qa_tuya_3'], detail: 'Carteras Propias – qa – tuya (3 databases)', state_type: 1, responsible: RESPONSIBLE },
  { environment: 'qa', portfolio_type: 'propias', campaign: 'laika', data_bases: ['demandas_propias_qa_laika_1', 'demandas_propias_qa_laika_2', 'demandas_propias_qa_laika_3'], detail: 'Carteras Propias – qa – laika (3 databases)', state_type: 1, responsible: RESPONSIBLE },
  { environment: 'qa', portfolio_type: 'propias', campaign: 'claro', data_bases: ['demandas_propias_qa_claro_1', 'demandas_propias_qa_claro_2', 'demandas_propias_qa_claro_3'], detail: 'Carteras Propias – qa – claro (3 databases)', state_type: 1, responsible: RESPONSIBLE },
  { environment: 'pro', portfolio_type: 'propias', campaign: 'tuya', data_bases: ['demandas_propias_pro_tuya_1', 'demandas_propias_pro_tuya_2', 'demandas_propias_pro_tuya_3'], detail: 'Carteras Propias – pro – tuya (3 databases)', state_type: 1, responsible: RESPONSIBLE },
  { environment: 'pro', portfolio_type: 'propias', campaign: 'laika', data_bases: ['demandas_propias_pro_laika_1', 'demandas_propias_pro_laika_2', 'demandas_propias_pro_laika_3'], detail: 'Carteras Propias – pro – laika (3 databases)', state_type: 1, responsible: RESPONSIBLE },
  { environment: 'pro', portfolio_type: 'propias', campaign: 'claro', data_bases: ['demandas_propias_pro_claro_1', 'demandas_propias_pro_claro_2', 'demandas_propias_pro_claro_3'], detail: 'Carteras Propias – pro – claro (3 databases)', state_type: 1, responsible: RESPONSIBLE },
  { environment: 'dev', portfolio_type: 'sudameris', campaign: 'sura', data_bases: ['demandas_sudameris_dev_sura_1', 'demandas_sudameris_dev_sura_2', 'demandas_sudameris_dev_sura_3'], detail: 'Sudameris – dev – sura (3 databases)', state_type: 1, responsible: RESPONSIBLE },
  { environment: 'qa', portfolio_type: 'sudameris', campaign: 'sura', data_bases: ['demandas_sudameris_qa_sura_1', 'demandas_sudameris_qa_sura_2', 'demandas_sudameris_qa_sura_3'], detail: 'Sudameris – qa – sura (3 databases)', state_type: 1, responsible: RESPONSIBLE },
  { environment: 'pro', portfolio_type: 'sudameris', campaign: 'sura', data_bases: ['demandas_sudameris_pro_sura_1', 'demandas_sudameris_pro_sura_2', 'demandas_sudameris_pro_sura_3'], detail: 'Sudameris – pro – sura (3 databases)', state_type: 1, responsible: RESPONSIBLE },
];

async function run(): Promise<void> {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_CONFIG_HOST ?? 'localhost',
    port: parseInt(process.env.DB_CONFIG_PORT ?? '3306', 10),
    username: process.env.DB_CONFIG_USER ?? 'root',
    password: process.env.DB_CONFIG_PASSWORD ?? '',
    database: process.env.DB_CONFIG_DATABASE ?? 'bot_demandas_online',
    synchronize: false,
  });

  await dataSource.initialize();

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  for (const row of seeds) {
    const [existing] = await dataSource.query(
      `SELECT 1 FROM config_data_bases 
       WHERE environment = ? AND portfolio_type = ? AND campaign = ? LIMIT 1`,
      [row.environment, row.portfolio_type, row.campaign],
    );
    if (existing) {
      console.log(
        `[seed] Already exists ${row.environment}/${row.portfolio_type}/${row.campaign}, skipped.`,
      );
      continue;
    }
    await dataSource.query(
      `INSERT INTO config_data_bases 
       (environment, portfolio_type, campaign, data_bases, detail, state_type, created_at, updated_at, responsible)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.environment,
        row.portfolio_type,
        row.campaign,
        JSON.stringify(row.data_bases),
        row.detail,
        row.state_type,
        now,
        now,
        row.responsible,
      ],
    );
    console.log(`[seed] Inserted ${row.environment} / ${row.portfolio_type} / ${row.campaign}`);
  }

  await dataSource.destroy();
  console.log('[seed] Done.');
}

run().catch((err) => {
  console.error('[seed] Error:', err);
  process.exit(1);
});
