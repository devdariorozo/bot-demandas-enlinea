// Responsabilidad: implementación concreta de ClassProcessRepository con TypeORM.

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ClassProcess } from '@domain/entities/classProcess.entities';
import {
  CreateClassProcessInput,
  ClassProcessRepository,
} from '@domain/ports/classProcess.ports';
import { ClassProcessEntity } from '../entities/classProcess.entities';
import { StateTypeEntity } from '../entities/stateType.entities';

@Injectable()
export class ClassProcessRepositoryImpl implements ClassProcessRepository {
  private readonly repo: Repository<ClassProcessEntity>;

  constructor(@InjectDataSource() dataSource: DataSource) {
    this.repo = dataSource.getRepository(ClassProcessEntity);
  }

  async create(input: CreateClassProcessInput): Promise<ClassProcess> {
    const now = new Date();
    const entity: Partial<ClassProcessEntity> = {
      specialty_process_id: input.specialty_process_id,
      type: input.type,
      detail: input.detail,
      state_type_id: input.state_type_id,
      created_at: input.created_at ?? now,
      updated_at: input.updated_at ?? now,
      responsible: input.responsible,
    };
    const saved = await this.repo.save(entity as ClassProcessEntity);
    return this.toDomain(saved);
  }

  async findActiveDuplicate(
    specialtyProcessId: number,
    type: string,
    excludeId?: number,
  ): Promise<ClassProcess | null> {
    const activeState = await this.repo.manager
      .getRepository(StateTypeEntity)
      .createQueryBuilder('st')
      .where('st.type = :type', { type: 'Active' })
      .getOne();

    if (!activeState) {
      return null;
    }

    const qb = this.repo
      .createQueryBuilder('cp')
      .where('cp.specialty_process_id = :specialtyProcessId', { specialtyProcessId })
      .andWhere('cp.type = :type', { type })
      .andWhere('cp.state_type_id = :stateTypeId', { stateTypeId: activeState.id });

    if (excludeId != null) {
      qb.andWhere('cp.id != :excludeId', { excludeId });
    }

    const entity = await qb.getOne();
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<ClassProcess[]> {
    const raw = await this.repo
      .createQueryBuilder('cp')
      .leftJoin(StateTypeEntity, 'st', 'st.id = cp.state_type_id')
      .select([
        'cp.id',
        'cp.specialty_process_id',
        'cp.type',
        'cp.detail',
        'cp.state_type_id',
        'cp.created_at',
        'cp.updated_at',
        'cp.responsible',
      ])
      .addSelect('st.type', 'state_type_name')
      .getRawMany();

    return raw.map((row: Record<string, unknown>) => ({
      id: row.cp_id as number,
      specialty_process_id: row.cp_specialty_process_id as number,
      type: row.cp_type as string,
      detail: row.cp_detail as string,
      state_type_id: row.cp_state_type_id as number,
      state_type_name: (row.state_type_name as string) ?? '',
      created_at: row.cp_created_at as Date,
      updated_at: row.cp_updated_at as Date,
      responsible: row.cp_responsible as string,
    }));
  }

  async findById(id: number): Promise<ClassProcess> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) {
      throw new Error('Class process not found');
    }
    return this.toDomain(entity);
  }

  async findBySpecialtyId(specialtyProcessId: number): Promise<ClassProcess[]> {
    const raw = await this.repo
      .createQueryBuilder('cp')
      .leftJoin(StateTypeEntity, 'st', 'st.id = cp.state_type_id')
      .where('cp.specialty_process_id = :specialtyProcessId', { specialtyProcessId })
      .select([
        'cp.id',
        'cp.specialty_process_id',
        'cp.type',
        'cp.detail',
        'cp.state_type_id',
        'cp.created_at',
        'cp.updated_at',
        'cp.responsible',
      ])
      .addSelect('st.type', 'state_type_name')
      .getRawMany();

    return raw.map((row: Record<string, unknown>) => ({
      id: row.cp_id as number,
      specialty_process_id: row.cp_specialty_process_id as number,
      type: row.cp_type as string,
      detail: row.cp_detail as string,
      state_type_id: row.cp_state_type_id as number,
      state_type_name: (row.state_type_name as string) ?? '',
      created_at: row.cp_created_at as Date,
      updated_at: row.cp_updated_at as Date,
      responsible: row.cp_responsible as string,
    }));
  }

  async update(classProcess: ClassProcess): Promise<ClassProcess> {
    const entity: ClassProcessEntity = {
      id: classProcess.id,
      specialty_process_id: classProcess.specialty_process_id,
      type: classProcess.type,
      detail: classProcess.detail,
      state_type_id: classProcess.state_type_id,
      created_at: classProcess.created_at,
      updated_at: classProcess.updated_at,
      responsible: classProcess.responsible,
    };
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(entity: ClassProcessEntity): ClassProcess {
    return {
      id: entity.id,
      specialty_process_id: entity.specialty_process_id,
      type: entity.type,
      detail: entity.detail,
      state_type_id: entity.state_type_id,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      responsible: entity.responsible,
    };
  }
}
