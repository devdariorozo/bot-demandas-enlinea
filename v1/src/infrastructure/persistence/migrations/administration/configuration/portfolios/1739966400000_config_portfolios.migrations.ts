//===============================================================
// Migración de estructura: solo tabla config_portfolios.
//===============================================================

import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateConfigPortfolios1739966400000 implements MigrationInterface {
  name = 'CreateConfigPortfolios1739966400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'config_portfolios',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'portfolio_type',
            type: 'varchar',
            length: '100',
            comment: 'Portfolio type (e.g. propias, sudameris)',
          },
          {
            name: 'detail',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Description or detail',
          },
          {
            name: 'state_type',
            type: 'tinyint',
            default: 1,
            comment: 'State: 0 = inactive, 1 = active',
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'responsible',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Responsible person or team',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('config_portfolios');
  }
}