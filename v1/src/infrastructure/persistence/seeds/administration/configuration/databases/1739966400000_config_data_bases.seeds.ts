import { DataSource } from 'typeorm';

const RESPONSIBLE = 'BOT Demands Online';

export const CONFIG_DATA_BASES_SEEDS = [
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

const TABLE = 'config_data_bases';

/**
 * Inserta los seeds de config_data_bases.
 * Primero hace TRUNCATE de la tabla para dejarla en limpio y luego inserta
 * todas las filas definidas en CONFIG_DATA_BASES_SEEDS.
 */
export async function runConfigDataBasesSeeds(
  dataSource: DataSource,
): Promise<void> {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  await dataSource.query(`TRUNCATE TABLE \`${TABLE}\``);
  console.log('[seed] config_data_bases: table truncated');

  for (const row of CONFIG_DATA_BASES_SEEDS) {
    await dataSource.query(
      `INSERT INTO \`${TABLE}\` (environment, portfolio_type, campaign, data_bases, detail, state_type, created_at, updated_at, responsible)
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
    console.log(
      `[seed] config_data_bases: inserted ${row.environment} / ${row.portfolio_type} / ${row.campaign}`,
    );
  }
}
