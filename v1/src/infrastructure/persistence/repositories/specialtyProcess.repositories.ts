// Responsabilidad: implementación concreta de SpecialtyProcessRepository con TypeORM.

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { SpecialtyProcess } from '@domain/entities/specialtyProcess.entities';
import {
  CreateSpecialtyProcessInput,
  SpecialtyProcessRepository,
} from '@domain/ports/specialtyProcess.ports';
import { SpecialtyProcessEntity } from '../entities/specialtyProcess.entities';
import { StateTypeEntity } from '../entities/stateType.entities';

@Injectable()
export class SpecialtyProcessRepositoryImpl implements SpecialtyProcessRepository {
  private readonly repo: Repository<SpecialtyProcessEntity>;

  constructor(@InjectDataSource() dataSource: DataSource) {
    this.repo = dataSource.getRepository(SpecialtyProcessEntity);
  }

  // Crear una nueva especialidad de proceso
  async create(input: CreateSpecialtyProcessInput): Promise<SpecialtyProcess> {
    const now = new Date();
    const entity: Partial<SpecialtyProcessEntity> = {
      type: input.type,
      detail: input.detail,
      state_type_id: input.state_type_id,
      created_at: input.created_at ?? now,
      updated_at: input.updated_at ?? now,
      responsible: input.responsible,
    };
    const saved = await this.repo.save(entity as SpecialtyProcessEntity);
    return saved;
  }

  // Buscar duplicado ACTIVE por type; devuelve null si no existe
  async findActiveDuplicate(type: string): Promise<SpecialtyProcess | null> {
    const activeState = await this.repo.manager
      .getRepository(StateTypeEntity)
      .createQueryBuilder('st')
      .where('st.type = :type', { type: 'Active' })
      .getOne();

    if (!activeState) {
      return null;
    }

    const entity = await this.repo.findOneBy({ type, state_type_id: activeState.id });
    return entity ?? null;
  }

  // Obtener todas las especialidades (con nombre de estado vía JOIN)
  async findAll(): Promise<SpecialtyProcess[]> {
    const raw = await this.repo
      .createQueryBuilder('sp')
      .leftJoin(StateTypeEntity, 'st', 'st.id = sp.state_type_id')
      .select([
        'sp.id',
        'sp.type',
        'sp.detail',
        'sp.state_type_id',
        'sp.created_at',
        'sp.updated_at',
        'sp.responsible',
      ])
      .addSelect('st.type', 'state_type_name')
      .getRawMany();

    return raw.map((row: Record<string, unknown>) => ({
      id: row.sp_id as number,
      type: row.sp_type as string,
      detail: row.sp_detail as string,
      state_type_id: row.sp_state_type_id as number,
      state_type_name: (row.state_type_name as string) ?? '',
      created_at: row.sp_created_at as Date,
      updated_at: row.sp_updated_at as Date,
      responsible: row.sp_responsible as string,
    }));
  }

  // Obtener una especialidad por su id
  async findById(id: number): Promise<SpecialtyProcess> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) {
      throw new Error('Specialty process not found');
    }
    return entity;
  }

  // Obtener una especialidad por su type (independiente del estado)
  async findByType(type: string): Promise<SpecialtyProcess> {
    const entity = await this.repo.findOneBy({ type });
    if (!entity) {
      throw new Error('Specialty process not found');
    }
    return entity;
  }

  // Actualizar una especialidad
  async update(specialty: SpecialtyProcess): Promise<SpecialtyProcess> {
    const saved = await this.repo.save(specialty as SpecialtyProcessEntity);
    return saved;
  }

  // Eliminar una especialidad
  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

