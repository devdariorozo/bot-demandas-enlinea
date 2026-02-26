// Responsabilidad: la entidad TypeORM que mapea la tabla física.

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('class_process')
export class ClassProcessEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  specialty_process_id: number;

  @Column()
  type: string;

  @Column()
  detail: string;

  @Column()
  state_type_id: number;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  @Column()
  responsible: string;
}
