//===============================================================
// Migración de estructura: solo tabla config_portfolios.
//===============================================================

import {
    MigrationInterface,
    QueryRunner,
    TableUnique,
  } from 'typeorm';
  
  const UNIQUE_NAME = 'UQ_config_portfolios_portfolio_type';
  
  /**
   * Añade constraint UNIQUE(portfolio_type) para evitar duplicados a nivel de base de datos.
   */
  export class AddUniqueConfigPortfolios1739966400001 implements MigrationInterface {
    name = 'AddUniqueConfigPortfolios1739966400001';
  
    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createUniqueConstraint(
        'config_portfolios',
        new TableUnique({
          name: UNIQUE_NAME,
          columnNames: ['portfolio_type'],
        }),
      );
    }
  
    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropUniqueConstraint(
        'config_portfolios',
        new TableUnique({
          name: UNIQUE_NAME,
          columnNames: ['portfolio_type'],
        }),
      );
    }
  }
  