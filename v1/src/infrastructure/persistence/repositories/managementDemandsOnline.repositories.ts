// Responsabilidad: implementación concreta de ManagementDemandsOnlineRepository con TypeORM.

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ManagementDemandsOnline } from '@domain/entities/managementDemandsOnline.entities';
import {
  CreateManagementDemandsOnlineInput,
  ManagementDemandsOnlineRepository,
} from '@domain/ports/managementDemandsOnline.ports';
import { ManagementDemandsOnlineEntity } from '../entities/managementDemandsOnline.entities';
import { StateTypeEntity } from '../entities/stateType.entities';

@Injectable()
export class ManagementDemandsOnlineRepositoryImpl implements ManagementDemandsOnlineRepository {
  private readonly repo: Repository<ManagementDemandsOnlineEntity>;

  constructor(@InjectDataSource() dataSource: DataSource) {
    this.repo = dataSource.getRepository(ManagementDemandsOnlineEntity);
  }

  async create(input: CreateManagementDemandsOnlineInput): Promise<ManagementDemandsOnline> {
    const now = new Date();
    const entity: Partial<ManagementDemandsOnlineEntity> = {
      name_data_base: input.name_data_base,
      portfolio_city_config_id: input.portfolio_city_config_id,
      campaign_id: input.campaign_id,
      lawsuit_id: input.lawsuit_id,
      lawsuit_court_assignments_id: input.lawsuit_court_assignments_id,
      client_id: input.client_id,
      path_law_doc: input.path_law_doc,
      lawsuit_status: input.lawsuit_status,
      amount_type_id: input.amount_type_id,
      user_id: input.user_id ?? 0,
      user_name: input.user_name ?? 'BOT demands online',
      detail: input.detail ?? 'Demanda pendiente para ser gestionada por el bot demands online',
      state_type_id: input.state_type_id ?? 1,
      responsible: input.responsible ?? 'BOT demands online',
      created_at: input.created_at ?? now,
      updated_at: input.updated_at ?? now,
    };
    const saved = await this.repo.save(entity as ManagementDemandsOnlineEntity);
    return saved;
  }

  async findAll(): Promise<ManagementDemandsOnline[]> {
    const raw = await this.repo
      .createQueryBuilder('m')
      .leftJoin(StateTypeEntity, 'st', 'st.id = m.state_type_id')
      .select([
        'm.id',
        'm.name_data_base',
        'm.portfolio_city_config_id',
        'm.campaign_id',
        'm.lawsuit_id',
        'm.lawsuit_court_assignments_id',
        'm.client_id',
        'm.path_law_doc',
        'm.lawsuit_status',
        'm.amount_type_id',
        'm.user_id',
        'm.user_name',
        'm.detail',
        'm.state_type_id',
        'm.created_at',
        'm.updated_at',
        'm.responsible',
      ])
      .addSelect('st.type', 'state_type_name')
      .getRawMany();

    return raw.map((row: Record<string, unknown>) => ({
      id: row.m_id as number,
      name_data_base: row.m_name_data_base as string,
      portfolio_city_config_id: row.m_portfolio_city_config_id as number,
      campaign_id: row.m_campaign_id as number,
      lawsuit_id: row.m_lawsuit_id as number,
      lawsuit_court_assignments_id: row.m_lawsuit_court_assignments_id as number,
      client_id: row.m_client_id as number,
      path_law_doc: row.m_path_law_doc as string,
      lawsuit_status: row.m_lawsuit_status as string,
      amount_type_id: row.m_amount_type_id as number,
      user_id: row.m_user_id as number,
      user_name: row.m_user_name as string,
      detail: row.m_detail as string,
      state_type_id: row.m_state_type_id as number,
      state_type_name: (row.state_type_name as string) ?? '',
      created_at: row.m_created_at as Date,
      updated_at: row.m_updated_at as Date,
      responsible: row.m_responsible as string,
    }));
  }

  async findById(id: number): Promise<ManagementDemandsOnline> {
    const found = await this.repo.findOneBy({ id });
    if (!found) {
      throw new Error('Management demands online record not found');
    }
    return found;
  }

  async findByLawsuitCourtAssignmentsIdAndBase(
    lawsuit_court_assignments_id: number,
    name_data_base: string,
  ): Promise<ManagementDemandsOnline | null> {
    const found = await this.repo.findOne({
      where: { lawsuit_court_assignments_id, name_data_base },
    });
    return found ?? null;
  }

  async update(record: ManagementDemandsOnline): Promise<ManagementDemandsOnline> {
    return this.repo.save(record);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
