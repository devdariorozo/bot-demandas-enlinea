import {
  MigrationInterface,
  QueryRunner,
  TableUnique,
} from 'typeorm';

const UNIQUE_NAME = 'UQ_config_data_bases_environment_portfolio_campaign';

/**
 * Añade constraint UNIQUE(environment, portfolio_type, campaign) para evitar
 * duplicados a nivel de base de datos cuando campaign no es NULL.
 * La aplicación además valida en el servicio (incl. campaign null/vacío).
 */
export class AddUniqueConfigDataBases1739966400001 implements MigrationInterface {
  name = 'AddUniqueConfigDataBases1739966400001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createUniqueConstraint(
      'config_data_bases',
      new TableUnique({
        name: UNIQUE_NAME,
        columnNames: ['environment', 'portfolio_type', 'campaign'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint(
      'config_data_bases',
      new TableUnique({
        name: UNIQUE_NAME,
        columnNames: ['environment', 'portfolio_type', 'campaign'],
      }),
    );
  }
}
