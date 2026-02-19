import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';

export class CreateConfigDataBasesTable1739966400000
  implements MigrationInterface
{
  name = 'CreateConfigDataBasesTable1739966400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'config_data_bases',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'environment',
            type: 'varchar',
            length: '20',
            comment: 'Environment: dev, qa, pro',
          },
          {
            name: 'portfolio_type',
            type: 'varchar',
            length: '100',
            comment: 'Portfolio type (e.g. propias = Carteras Propias)',
          },
          {
            name: 'campaign',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Campaign identifier',
          },
          {
            name: 'data_bases',
            type: 'json',
            comment: 'Array of database names to connect',
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
      true,
    );

    await queryRunner.createIndex(
      'config_data_bases',
      new TableIndex({
        name: 'IDX_config_data_bases_environment_portfolio',
        columnNames: ['environment', 'portfolio_type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('config_data_bases', true);
  }
}
