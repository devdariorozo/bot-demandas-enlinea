// Responsabilidad: implementación concreta de AttentionScheduleRepository con TypeORM.

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AttentionSchedule } from '@domain/entities/attentionSchedule.entities';
import {
  AttentionScheduleRepository,
  CreateAttentionScheduleInput,
} from '@domain/ports/attentionSchedule.ports';
import { AttentionScheduleEntity } from '../entities/attentionSchedule.entities';
import { PortfolioTypeEntity } from '../entities/portfolioType.entities';
import { CampaingTypeEntity } from '../entities/campaingType.entities';
import { StateTypeEntity } from '../entities/stateType.entities';

@Injectable()
export class AttentionScheduleRepositoryImpl implements AttentionScheduleRepository {
  private readonly repo: Repository<AttentionScheduleEntity>;

  constructor(@InjectDataSource() dataSource: DataSource) {
    this.repo = dataSource.getRepository(AttentionScheduleEntity);
  }

  // Crear un nuevo horario
  async create(input: CreateAttentionScheduleInput): Promise<AttentionSchedule> {
    const now = new Date();
    const entity: Partial<AttentionScheduleEntity> = {
      portfolio_type_id: input.portfolio_type_id,
      campaing_type_id: input.campaing_type_id,
      day_of_week: input.day_of_week,
      shiftType: input.shiftType,
      start_time: input.start_time,
      end_time: input.end_time,
      detail: input.detail,
      state_type_id: input.state_type_id,
      created_at: input.created_at ?? now,
      updated_at: input.updated_at ?? now,
      responsible: input.responsible,
    };
    const saved = await this.repo.save(entity as AttentionScheduleEntity);
    return saved;
  }

  // Obtener todos los horarios (con nombres vía JOIN)
  async findAll(): Promise<AttentionSchedule[]> {
    const raw = await this.repo
      .createQueryBuilder('sc')
      .leftJoin(PortfolioTypeEntity, 'pf', 'pf.id = sc.portfolio_type_id')
      .leftJoin(CampaingTypeEntity, 'cp', 'cp.id = sc.campaing_type_id')
      .leftJoin(StateTypeEntity, 'st', 'st.id = sc.state_type_id')
      .select([
        'sc.id',
        'sc.portfolio_type_id',
        'sc.campaing_type_id',
        'sc.day_of_week',
        'sc.shift_type',
        'sc.start_time',
        'sc.end_time',
        'sc.detail',
        'sc.state_type_id',
        'sc.created_at',
        'sc.updated_at',
        'sc.responsible',
      ])
      .addSelect('pf.type', 'portfolio_type_name')
      .addSelect('cp.type', 'campaing_type_name')
      .addSelect('st.type', 'state_type_name')
      .getRawMany();

    return raw.map((row: Record<string, unknown>) => ({
      id: row.sc_id as number,
      portfolio_type_id: row.sc_portfolio_type_id as number,
      portfolio_type_name: (row.portfolio_type_name as string) ?? '',
      campaing_type_id: row.sc_campaing_type_id as number,
      campaing_type_name: (row.campaing_type_name as string) ?? '',
      day_of_week: row.sc_day_of_week as string,
      shiftType: row.sc_shift_type as string,
      start_time: row.sc_start_time as string,
      end_time: row.sc_end_time as string,
      detail: row.sc_detail as string,
      state_type_id: row.sc_state_type_id as number,
      state_type_name: (row.state_type_name as string) ?? '',
      created_at: row.sc_created_at as Date,
      updated_at: row.sc_updated_at as Date,
      responsible: row.sc_responsible as string,
    }));
  }

  // Obtener un horario por su id
  async findById(id: number): Promise<AttentionSchedule> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) {
      throw new Error('Attention schedule not found');
    }
    return entity;
  }

  // Obtener todos los horarios para una combinación cartera/campaña y día
  async findByPortfolioCampaingAndDay(
    portfolio_type_id: number,
    campaing_type_id: number,
    day_of_week: string,
  ): Promise<AttentionSchedule[]> {
    return this.repo.find({
      where: { portfolio_type_id, campaing_type_id, day_of_week },
    });
  }

  // Actualizar un horario
  async update(attentionSchedule: AttentionSchedule): Promise<AttentionSchedule> {
    const saved = await this.repo.save(attentionSchedule as AttentionScheduleEntity);
    return saved;
  }

  // Eliminar un horario
  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

