// Responsabilidad: implementación concreta de CityRepository con TypeORM.

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { City } from '@domain/entities/city.entities';
import {
  CityRepository,
  CreateCityInput,
} from '@domain/ports/city.ports';
import { CityEntity } from '../entities/city.entities';
import { DepartamentEntity } from '../entities/departament.entities';
import { StateTypeEntity } from '../entities/stateType.entities';

@Injectable()
export class CityRepositoryImpl implements CityRepository {
  private readonly repo: Repository<CityEntity>;

  constructor(@InjectDataSource() dataSource: DataSource) {
    this.repo = dataSource.getRepository(CityEntity);
  }

  // Crear una nueva ciudad
  async create(input: CreateCityInput): Promise<City> {
    const now = new Date();
    const entity: Partial<CityEntity> = {
      departament_id: input.departament_id,
      name: input.name,
      detail: input.detail,
      state_type_id: input.state_type_id,
      created_at: input.created_at ?? now,
      updated_at: input.updated_at ?? now,
      responsible: input.responsible,
    };
    const saved = await this.repo.save(entity as CityEntity);
    return saved;
  }

  // Buscar duplicado por nombre + departamento; devuelve null si no existe
  async findByDuplicate(name: string, departament_id: number): Promise<City | null> {
    const entity = await this.repo.findOneBy({ name, departament_id });
    return entity ?? null;
  }

  // Obtener todas las ciudades (con nombres de departamento y estado vía JOIN)
  async findAll(): Promise<City[]> {
    const raw = await this.repo
      .createQueryBuilder('ct')
      .leftJoin(DepartamentEntity, 'dp', 'dp.id = ct.departament_id')
      .leftJoin(StateTypeEntity, 'st', 'st.id = ct.state_type_id')
      .select([
        'ct.id',
        'ct.departament_id',
        'ct.name',
        'ct.detail',
        'ct.state_type_id',
        'ct.created_at',
        'ct.updated_at',
        'ct.responsible',
      ])
      .addSelect('dp.name', 'departament_name')
      .addSelect('st.type', 'state_type_name')
      .getRawMany();

    return raw.map((row: Record<string, unknown>) => ({
      id: row.ct_id as number,
      departament_id: row.ct_departament_id as number,
      departament_name: (row.departament_name as string) ?? '',
      name: row.ct_name as string,
      detail: row.ct_detail as string,
      state_type_id: row.ct_state_type_id as number,
      state_type_name: (row.state_type_name as string) ?? '',
      created_at: row.ct_created_at as Date,
      updated_at: row.ct_updated_at as Date,
      responsible: row.ct_responsible as string,
    }));
  }

  // Obtener una ciudad por su id
  async findById(id: number): Promise<City> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) {
      throw new Error('City not found');
    }
    return entity;
  }

  // Obtener ciudades por departamento
  async findByDepartament(departament_id: number): Promise<City[]> {
    return this.repo.find({ where: { departament_id } });
  }

  // Actualizar una ciudad
  async update(city: City): Promise<City> {
    const saved = await this.repo.save(city as CityEntity);
    return saved;
  }

  // Eliminar una ciudad
  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

