// Responsabilidad: implementación concreta de ClassProcessConfigRepository con TypeORM.

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ClassProcessConfig } from '@domain/entities/classProcessConfig.entities';
import { ClassProcessConfigEntity } from '../entities/classProcessConfig.entities';
import {
  ClassProcessConfigRepository,
  CreateClassProcessConfigInput,
} from '@domain/ports/classProcessConfig.ports';
import { PortfolioTypeEntity } from '../entities/portfolioType.entities';
import { CampaingTypeEntity } from '../entities/campaingType.entities';
import { StateTypeEntity } from '../entities/stateType.entities';

@Injectable()
export class ClassProcessConfigRepositoryImpl implements ClassProcessConfigRepository {
  private readonly repo: Repository<ClassProcessConfigEntity>;

  constructor(@InjectDataSource() dataSource: DataSource) {
    this.repo = dataSource.getRepository(ClassProcessConfigEntity);
  }

  async create(input: CreateClassProcessConfigInput): Promise<ClassProcessConfig> {
    const now = new Date();
    const entity: Partial<ClassProcessConfigEntity> = {
      portfolio_type_id: input.portfolio_type_id,
      campaing_type_id: input.campaing_type_id,
      class_process_ids: input.class_process_ids,
      detail: input.detail,
      state_type_id: input.state_type_id,
      created_at: input.created_at ?? now,
      updated_at: input.updated_at ?? now,
      responsible: input.responsible,
    };
    const saved = await this.repo.save(entity as ClassProcessConfigEntity);
    return saved as unknown as ClassProcessConfig;
  }

  async findAll(): Promise<ClassProcessConfig[]> {
    const raw = await this.repo
      .createQueryBuilder('cpc')
      .leftJoin(PortfolioTypeEntity, 'pf', 'pf.id = cpc.portfolio_type_id')
      .leftJoin(CampaingTypeEntity, 'cp', 'cp.id = cpc.campaing_type_id')
      .leftJoin(StateTypeEntity, 'st', 'st.id = cpc.state_type_id')
      .select([
        'cpc.id',
        'cpc.portfolio_type_id',
        'cpc.campaing_type_id',
        'cpc.class_process_ids',
        'cpc.detail',
        'cpc.state_type_id',
        'cpc.created_at',
        'cpc.updated_at',
        'cpc.responsible',
      ])
      .addSelect('pf.type', 'portfolio_type_name')
      .addSelect('cp.type', 'campaing_type_name')
      .addSelect('st.type', 'state_type_name')
      .getRawMany();

    return raw.map((row: Record<string, unknown>) => ({
      id: row.cpc_id as number,
      portfolio_type_id: row.cpc_portfolio_type_id as number,
      portfolio_type_name: (row.portfolio_type_name as string) ?? '',
      campaing_type_id: row.cpc_campaing_type_id as number,
      campaing_type_name: (row.campaing_type_name as string) ?? '',
      class_process_ids: row.cpc_class_process_ids as number[],
      detail: row.cpc_detail as string,
      state_type_id: row.cpc_state_type_id as number,
      state_type_name: (row.state_type_name as string) ?? '',
      created_at: row.cpc_created_at as Date,
      updated_at: row.cpc_updated_at as Date,
      responsible: row.cpc_responsible as string,
    }));
  }

  async findById(id: number): Promise<ClassProcessConfig> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) {
      throw new Error('ClassProcessConfig record not found');
    }
    return entity as unknown as ClassProcessConfig;
  }

  async findByPortfolioAndCampaing(
    portfolio_type_id: number,
    campaing_type_id: number,
  ): Promise<ClassProcessConfig[]> {
    const all = await this.findAll();
    return all.filter(
      (c) =>
        c.portfolio_type_id === portfolio_type_id && c.campaing_type_id === campaing_type_id,
    );
  }

  async update(config: ClassProcessConfig): Promise<ClassProcessConfig> {
    const saved = await this.repo.save({
      id: config.id,
      portfolio_type_id: config.portfolio_type_id,
      campaing_type_id: config.campaing_type_id,
      class_process_ids: config.class_process_ids,
      detail: config.detail,
      state_type_id: config.state_type_id,
      responsible: config.responsible,
    } as ClassProcessConfigEntity);
    return saved as unknown as ClassProcessConfig;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
