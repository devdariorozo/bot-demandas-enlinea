// Responsabilidad: implementación concreta de DepartamentRepository con TypeORM.

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Departament } from '@domain/entities/departament.entities';
import {
  CreateDepartamentInput,
  DepartamentRepository,
} from '@domain/ports/departament.ports';
import { DepartamentEntity } from '../entities/departament.entities';
import { StateTypeEntity } from '../entities/stateType.entities';

@Injectable()
export class DepartamentRepositoryImpl implements DepartamentRepository {
  private readonly repo: Repository<DepartamentEntity>;

  constructor(@InjectDataSource() dataSource: DataSource) {
    this.repo = dataSource.getRepository(DepartamentEntity);
  }

  // Crear un nuevo departamento
  async create(input: CreateDepartamentInput): Promise<Departament> {
    const now = new Date();
    const entity: Partial<DepartamentEntity> = {
      name: input.name,
      detail: input.detail,
      state_type_id: input.state_type_id,
      created_at: input.created_at ?? now,
      updated_at: input.updated_at ?? now,
      responsible: input.responsible,
    };
    const saved = await this.repo.save(entity as DepartamentEntity);
    return saved;
  }

  // Buscar duplicado por nombre; devuelve null si no existe
  async findByDuplicate(name: string): Promise<Departament | null> {
    const entity = await this.repo.findOneBy({ name });
    return entity ?? null;
  }

  // Obtener todos los departamentos (con nombre de estado vía JOIN)
  async findAll(): Promise<Departament[]> {
    const raw = await this.repo
      .createQueryBuilder('dp')
      .leftJoin(StateTypeEntity, 'st', 'st.id = dp.state_type_id')
      .select([
        'dp.id',
        'dp.name',
        'dp.detail',
        'dp.state_type_id',
        'dp.created_at',
        'dp.updated_at',
        'dp.responsible',
      ])
      .addSelect('st.type', 'state_type_name')
      .getRawMany();

    return raw.map((row: Record<string, unknown>) => ({
      id: row.dp_id as number,
      name: row.dp_name as string,
      detail: row.dp_detail as string,
      state_type_id: row.dp_state_type_id as number,
      state_type_name: (row.state_type_name as string) ?? '',
      created_at: row.dp_created_at as Date,
      updated_at: row.dp_updated_at as Date,
      responsible: row.dp_responsible as string,
    }));
  }

  // Obtener un departamento por su id
  async findById(id: number): Promise<Departament> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) {
      throw new Error('Departament not found');
    }
    return entity;
  }

  // Obtener un departamento por su nombre
  async findByName(name: string): Promise<Departament> {
    const entity = await this.repo.findOneBy({ name });
    if (!entity) {
      throw new Error('Departament not found');
    }
    return entity;
  }

  // Actualizar un departamento
  async update(departament: Departament): Promise<Departament> {
    const saved = await this.repo.save(departament as DepartamentEntity);
    return saved;
  }

  // Eliminar un departamento
  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

