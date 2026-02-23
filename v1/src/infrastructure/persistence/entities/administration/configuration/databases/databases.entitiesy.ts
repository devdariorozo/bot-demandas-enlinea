import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('config_data_bases')
export class ConfigDataBasesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, comment: 'Environment: dev, qa, pro' })
  environment: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'Portfolio type (e.g. propias, sudameris)',
  })
  portfolio_type: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Campaign identifier',
  })
  campaign: string | null;

  @Column({
    type: 'json',
    comment: 'Array of database names to connect',
  })
  data_bases: string[];

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Description or detail',
  })
  detail: string | null;

  @Column({
    type: 'tinyint',
    default: 1,
    comment: 'State: 0 = inactive, 1 = active',
  })
  state_type: number;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Responsible person or team',
  })
  responsible: string | null;
}
