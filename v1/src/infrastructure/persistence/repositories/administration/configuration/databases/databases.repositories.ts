import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigDataBasesEntity } from '@infrastructure/persistence/entities/administration/configuration/databases/databases.entitiesy';
import {
  ConfigDataBasesRepositoryPort,
} from '@domain/ports/administration/configuration/databases/databases.port';
import { ConfigDataBases } from '@domain/entities/administration/configuration/databases/databases.interface';

const STATE_LABELS: Record<number, string> = {
  0: 'Inactivo',
  1: 'Activo',
};

@Injectable()
export class ConfigDataBasesRepository implements ConfigDataBasesRepositoryPort {
  constructor(
    @InjectRepository(ConfigDataBasesEntity)
    private readonly repo: Repository<ConfigDataBasesEntity>,
  ) {}

  async create(entity: Partial<ConfigDataBases>): Promise<ConfigDataBases> {
    const created = this.repo.create(entity);
    const saved = await this.repo.save(created);
    return this.toDomain(saved);
  }

  async findByNaturalKey(
    environment: string,
    portfolio_type: string,
    campaign?: string | null,
  ): Promise<ConfigDataBases | null> {
    const qb = this.repo
      .createQueryBuilder('c')
      .where('c.environment = :environment', { environment })
      .andWhere('c.portfolio_type = :portfolio_type', { portfolio_type });
    if (campaign === undefined || campaign === null || campaign === '') {
      qb.andWhere('(c.campaign IS NULL OR c.campaign = :empty)', {
        empty: '',
      });
    } else {
      qb.andWhere('c.campaign = :campaign', { campaign });
    }
    const one = await qb.getOne();
    return one ? this.toDomain(one) : null;
  }

  async findAll(filters?: {
    environment?: string;
    portfolio_type?: string;
    campaign?: string;
    state_type?: number;
  }): Promise<ConfigDataBases[]> {
    const qb = this.repo.createQueryBuilder('c');
    if (filters?.environment) {
      qb.andWhere('c.environment = :environment', {
        environment: filters.environment,
      });
    }
    if (filters?.portfolio_type) {
      qb.andWhere('c.portfolio_type = :portfolio_type', {
        portfolio_type: filters.portfolio_type,
      });
    }
    if (filters?.campaign) {
      qb.andWhere('c.campaign = :campaign', { campaign: filters.campaign });
    }
    if (filters?.state_type !== undefined) {
      qb.andWhere('c.state_type = :state_type', {
        state_type: filters.state_type,
      });
    }
    qb.orderBy('c.environment', 'ASC')
      .addOrderBy('c.portfolio_type', 'ASC')
      .addOrderBy('c.campaign', 'ASC');
    const list = await qb.getMany();
    return list.map((e) => this.toDomain(e));
  }

  async findById(id: number): Promise<ConfigDataBases | null> {
    const one = await this.repo.findOne({ where: { id } });
    return one ? this.toDomain(one) : null;
  }

  async update(
    id: number,
    entity: Partial<ConfigDataBases>,
  ): Promise<ConfigDataBases> {
    await this.repo.update(id, entity as Partial<ConfigDataBasesEntity>);
    const updated = await this.repo.findOne({ where: { id } });
    if (!updated) throw new Error('ConfigDataBases not found after update');
    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async findDistinctEnvironments(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('c')
      .select('DISTINCT c.environment', 'environment')
      .orderBy('c.environment', 'ASC')
      .getRawMany<{ environment: string }>();
    return rows.map((r) => r.environment).filter(Boolean);
  }

  async findDistinctPortfolioTypes(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('c')
      .select('DISTINCT c.portfolio_type', 'portfolio_type')
      .orderBy('c.portfolio_type', 'ASC')
      .getRawMany<{ portfolio_type: string }>();
    return rows.map((r) => r.portfolio_type).filter(Boolean);
  }

  async findDistinctCampaigns(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('c')
      .select('DISTINCT c.campaign', 'campaign')
      .where('c.campaign IS NOT NULL AND c.campaign != :empty', { empty: '' })
      .orderBy('c.campaign', 'ASC')
      .getRawMany<{ campaign: string }>();
    return rows.map((r) => r.campaign).filter(Boolean);
  }

  async findDistinctStateTypes(): Promise<{ value: number; label: string }[]> {
    const rows = await this.repo
      .createQueryBuilder('c')
      .select('DISTINCT c.state_type', 'state_type')
      .orderBy('c.state_type', 'ASC')
      .getRawMany<{ state_type: number }>();
    return rows.map((r) => ({
      value: r.state_type,
      label: STATE_LABELS[r.state_type] ?? `Estado ${r.state_type}`,
    }));
  }

  private toDomain(entity: ConfigDataBasesEntity): ConfigDataBases {
    return {
      id: entity.id,
      environment: entity.environment,
      portfolio_type: entity.portfolio_type,
      campaign: entity.campaign,
      data_bases: entity.data_bases,
      detail: entity.detail,
      state_type: entity.state_type,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      responsible: entity.responsible,
    };
  }
}
