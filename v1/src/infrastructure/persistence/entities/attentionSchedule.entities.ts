// Responsabilidad: la entidad TypeORM que mapea la tabla física.

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('attention_schedule')
export class AttentionScheduleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  portfolio_type_id: number;

  @Column()
  campaing_type_id: number;

  @Column()
  day_of_week: string;

  @Column({ name: 'shift_type' })
  shiftType: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

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

