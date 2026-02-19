import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedConfigDataBases1739966400001 implements MigrationInterface {
  name = 'SeedConfigDataBases1739966400001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const table = 'config_data_bases';

    const RESPONSIBLE = 'BOT Demandas En Linea';

    const seeds = [
      // --- Carteras Propias: un registro por campaign por ambiente (tuya, laika, claro) ---
      { environment: 'dev', portfolio_type: 'propias', campaign: 'tuya', data_bases: ['demandas_propias_dev_tuya_1', 'demandas_propias_dev_tuya_2', 'demandas_propias_dev_tuya_3'], detail: 'Carteras Propias – dev – tuya (3 databases)', state_type: 1, responsible: RESPONSIBLE },
      { environment: 'dev', portfolio_type: 'propias', campaign: 'laika', data_bases: ['demandas_propias_dev_laika_1', 'demandas_propias_dev_laika_2', 'demandas_propias_dev_laika_3'], detail: 'Carteras Propias – dev – laika (3 databases)', state_type: 1, responsible: RESPONSIBLE },
      { environment: 'dev', portfolio_type: 'propias', campaign: 'claro', data_bases: ['demandas_propias_dev_claro_1', 'demandas_propias_dev_claro_2', 'demandas_propias_dev_claro_3'], detail: 'Carteras Propias – dev – claro (3 databases)', state_type: 1, responsible: RESPONSIBLE },
      { environment: 'qa', portfolio_type: 'propias', campaign: 'tuya', data_bases: ['demandas_propias_qa_tuya_1', 'demandas_propias_qa_tuya_2', 'demandas_propias_qa_tuya_3'], detail: 'Carteras Propias – qa – tuya (3 databases)', state_type: 1, responsible: RESPONSIBLE },
      { environment: 'qa', portfolio_type: 'propias', campaign: 'laika', data_bases: ['demandas_propias_qa_laika_1', 'demandas_propias_qa_laika_2', 'demandas_propias_qa_laika_3'], detail: 'Carteras Propias – qa – laika (3 databases)', state_type: 1, responsible: RESPONSIBLE },
      { environment: 'qa', portfolio_type: 'propias', campaign: 'claro', data_bases: ['demandas_propias_qa_claro_1', 'demandas_propias_qa_claro_2', 'demandas_propias_qa_claro_3'], detail: 'Carteras Propias – qa – claro (3 databases)', state_type: 1, responsible: RESPONSIBLE },
      { environment: 'pro', portfolio_type: 'propias', campaign: 'tuya', data_bases: ['demandas_propias_pro_tuya_1', 'demandas_propias_pro_tuya_2', 'demandas_propias_pro_tuya_3'], detail: 'Carteras Propias – pro – tuya (3 databases)', state_type: 1, responsible: RESPONSIBLE },
      { environment: 'pro', portfolio_type: 'propias', campaign: 'laika', data_bases: ['demandas_propias_pro_laika_1', 'demandas_propias_pro_laika_2', 'demandas_propias_pro_laika_3'], detail: 'Carteras Propias – pro – laika (3 databases)', state_type: 1, responsible: RESPONSIBLE },
      { environment: 'pro', portfolio_type: 'propias', campaign: 'claro', data_bases: ['demandas_propias_pro_claro_1', 'demandas_propias_pro_claro_2', 'demandas_propias_pro_claro_3'], detail: 'Carteras Propias – pro – claro (3 databases)', state_type: 1, responsible: RESPONSIBLE },
      // --- Sudameris: campaña sura, un registro por ambiente ---
      { environment: 'dev', portfolio_type: 'sudameris', campaign: 'sura', data_bases: ['demandas_sudameris_dev_sura_1', 'demandas_sudameris_dev_sura_2', 'demandas_sudameris_dev_sura_3'], detail: 'Sudameris – dev – sura (3 databases)', state_type: 1, responsible: RESPONSIBLE },
      { environment: 'qa', portfolio_type: 'sudameris', campaign: 'sura', data_bases: ['demandas_sudameris_qa_sura_1', 'demandas_sudameris_qa_sura_2', 'demandas_sudameris_qa_sura_3'], detail: 'Sudameris – qa – sura (3 databases)', state_type: 1, responsible: RESPONSIBLE },
      { environment: 'pro', portfolio_type: 'sudameris', campaign: 'sura', data_bases: ['demandas_sudameris_pro_sura_1', 'demandas_sudameris_pro_sura_2', 'demandas_sudameris_pro_sura_3'], detail: 'Sudameris – pro – sura (3 databases)', state_type: 1, responsible: RESPONSIBLE },
    ];

    for (const row of seeds) {
      await queryRunner.query(
        `INSERT INTO \`${table}\` (environment, portfolio_type, campaign, data_bases, detail, state_type, created_at, updated_at, responsible)
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
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM config_data_bases 
       WHERE (portfolio_type = 'propias' OR portfolio_type = 'sudameris')
       AND environment IN ('dev', 'qa', 'pro')`,
    );
  }
}
