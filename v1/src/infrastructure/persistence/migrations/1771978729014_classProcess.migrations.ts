// Responsabilidad: crear/eliminar la tabla en la BD.
// Relación: class_process tiene FK a specialty_process y a state_type.

import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClassProcessMigration1771978729014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE class_process (
        id INT AUTO_INCREMENT PRIMARY KEY,
        specialty_process_id INT NOT NULL,
        type VARCHAR(100) NOT NULL,
        detail VARCHAR(255) NOT NULL,
        state_type_id INT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        responsible VARCHAR(100) NOT NULL DEFAULT 'BOT demands online',
        CONSTRAINT UQ_class_process_specialty_type UNIQUE (specialty_process_id, type),
        CONSTRAINT FK_class_process_specialty_process
          FOREIGN KEY (specialty_process_id) REFERENCES specialty_process(id),
        CONSTRAINT FK_class_process_state_type
          FOREIGN KEY (state_type_id) REFERENCES state_type(id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE class_process');
  }
}
