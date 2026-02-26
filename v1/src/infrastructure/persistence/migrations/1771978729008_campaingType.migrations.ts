// Responsabilidad: crear/eliminar la tabla en la BD.

import { MigrationInterface, QueryRunner } from "typeorm";

export class CampaingTypeMigration1771978729008 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE campaing_type (
          id INT AUTO_INCREMENT PRIMARY KEY,
          type VARCHAR(20) NOT NULL,
          detail VARCHAR(100) NOT NULL,
          state_type_id INT NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          responsible VARCHAR(100) NOT NULL DEFAULT 'BOT demands online',
          CONSTRAINT UQ_campaing_type UNIQUE (type),
          CONSTRAINT FK_campaing_type_state_type
            FOREIGN KEY (state_type_id) REFERENCES state_type(id)
        )
      `);
    }
  
    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`DROP TABLE campaing_type`);
    }
  }