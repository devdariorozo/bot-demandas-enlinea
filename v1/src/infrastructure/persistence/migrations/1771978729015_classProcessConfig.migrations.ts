// Responsabilidad: crear/eliminar la tabla en la BD.
// Cruce cartera (portfolio) + campaña (campaing) con clases de proceso (class_process_ids JSON).

import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClassProcessConfigMigration1771978729015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE class_process_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        portfolio_type_id INT NOT NULL,
        campaing_type_id INT NOT NULL,
        class_process_ids JSON NOT NULL,
        detail VARCHAR(255) NOT NULL,
        state_type_id INT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        responsible VARCHAR(100) NOT NULL DEFAULT 'BOT demands online',
        CONSTRAINT UQ_class_process_config_port_camp UNIQUE (portfolio_type_id, campaing_type_id),
        CONSTRAINT FK_class_process_config_portfolio_type
          FOREIGN KEY (portfolio_type_id) REFERENCES portfolio_type(id),
        CONSTRAINT FK_class_process_config_campaing_type
          FOREIGN KEY (campaing_type_id) REFERENCES campaing_type(id),
        CONSTRAINT FK_class_process_config_state_type
          FOREIGN KEY (state_type_id) REFERENCES state_type(id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE class_process_config');
  }
}
