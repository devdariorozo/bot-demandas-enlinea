// Responsabilidad: implementación concreta de DataBasesRepository con TypeORM.

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { DataBases } from '@domain/entities/dataBases.entities';
import { DataBasesEntity } from '../entities/dataBases.entities';
import {
  DataBasesRepository,
  CreateDataBasesInput,
  VCitiesRow,
} from '@domain/ports/dataBases.ports';
import { EnvironmentTypeEntity } from '../entities/environmentType.entities';
import { PortfolioTypeEntity } from '../entities/portfolioType.entities';
import { StateTypeEntity } from '../entities/stateType.entities';

@Injectable()
export class DataBasesRepositoryImpl implements DataBasesRepository {
  private readonly repo: Repository<DataBasesEntity>;

  constructor(@InjectDataSource() dataSource: DataSource) {
    this.repo = dataSource.getRepository(DataBasesEntity);
  }

  // Crear un nuevo registro de bases
  async create(input: CreateDataBasesInput): Promise<DataBases> {
    const now = new Date();
    const entity: Partial<DataBasesEntity> = {
      environment_type_id: input.environment_type_id,
      portfolio_type_id: input.portfolio_type_id,
      bases: input.bases,
      detail: input.detail,
      state_type_id: input.state_type_id,
      created_at: input.created_at ?? now,
      updated_at: input.updated_at ?? now,
      responsible: input.responsible,
    };
    const saved = await this.repo.save(entity as DataBasesEntity);
    return saved;
  }

  // Obtener todos los registros de bases (con nombres de tipos vía JOIN)
  async findAll(): Promise<DataBases[]> {
    const raw = await this.repo
      .createQueryBuilder('db')
      .leftJoin(EnvironmentTypeEntity, 'env', 'env.id = db.environment_type_id')
      .leftJoin(PortfolioTypeEntity, 'pf', 'pf.id = db.portfolio_type_id')
      .leftJoin(StateTypeEntity, 'st', 'st.id = db.state_type_id')
      .select([
        'db.id',
        'db.environment_type_id',
        'db.portfolio_type_id',
        'db.bases',
        'db.detail',
        'db.state_type_id',
        'db.created_at',
        'db.updated_at',
        'db.responsible',
      ])
      .addSelect('env.type', 'environment_type_name')
      .addSelect('pf.type', 'portfolio_type_name')
      .addSelect('st.type', 'state_type_name')
      .getRawMany();

    return raw.map((row: Record<string, unknown>) => ({
      id: row.db_id as number,
      environment_type_id: row.db_environment_type_id as number,
      environment_type_name: (row.environment_type_name as string) ?? '',
      portfolio_type_id: row.db_portfolio_type_id as number,
      portfolio_type_name: (row.portfolio_type_name as string) ?? '',
      bases: row.db_bases as string[],
      detail: row.db_detail as string,
      state_type_id: row.db_state_type_id as number,
      state_type_name: (row.state_type_name as string) ?? '',
      created_at: row.db_created_at as Date,
      updated_at: row.db_updated_at as Date,
      responsible: row.db_responsible as string,
    }));
  }

  // Obtener un registro por su id
  async findById(id: number): Promise<DataBases> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) {
      throw new Error('DataBases record not found');
    }
    return entity;
  }

  // Actualizar un registro de bases
  async update(dataBases: DataBases): Promise<DataBases> {
    const saved = await this.repo.save(dataBases as DataBasesEntity);
    return saved;
  }

  // Eliminar un registro de bases
  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  /** Consultar la vista v_cities en la primera base del registro data_bases (posición 0). */
  async fetchVCitiesFromFirstBase(idDataBases: number): Promise<VCitiesRow[]> {
    const record = await this.findById(idDataBases);
    if (!record.bases || !Array.isArray(record.bases) || record.bases.length === 0) {
      throw new Error('No bases configured for this data_bases record');
    }
    const firstBase = record.bases[0];
    // Solo permitir nombres de BD alfanuméricos y guión bajo para evitar inyección
    if (!/^[a-zA-Z0-9_]+$/.test(firstBase)) {
      throw new Error('Invalid database name');
    }
    const sql = `SELECT id, city_name, department, city FROM \`${firstBase}\`.v_cities`;
    const rows = await this.repo.manager.query(sql);
    return rows as VCitiesRow[];
  }

  async runQueryOnBase(
    baseName: string,
    sql: string,
    params: unknown[] = [],
  ): Promise<Record<string, unknown>[]> {
    if (!/^[a-zA-Z0-9_]+$/.test(baseName)) {
      throw new Error('Invalid database name');
    }
    const rows = await this.repo.manager.query(sql, params);
    return (rows ?? []) as Record<string, unknown>[];
  }
}

