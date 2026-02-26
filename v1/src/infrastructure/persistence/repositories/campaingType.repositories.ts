// Responsabilidad: implementación concreta de CampaingTypeRepository con TypeORM.

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CampaingType } from '@domain/entities/campaingType.entities';
import {
    CampaingTypeRepository,
    CreateCampaingTypeInput,
} from '@domain/ports/campaingType.ports';
import { CampaingTypeEntity } from '../entities/campaingType.entities';
import { StateTypeEntity } from '../entities/stateType.entities';

@Injectable()
export class CampaingTypeRepositoryImpl implements CampaingTypeRepository {
    private readonly campaingTypeRepository: Repository<CampaingTypeEntity>;

    constructor(@InjectDataSource() dataSource: DataSource) {
        this.campaingTypeRepository = dataSource.getRepository(CampaingTypeEntity);
    }

    // Helpers de mapeo entre entidad de persistencia y entidad de dominio
    private toDomain(entity: CampaingTypeEntity): CampaingType {
        return {
            id: entity.id,
            type: entity.type,
            detail: entity.detail,
            state_type_id: entity.state_type_id,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
            responsible: entity.responsible,
            state_type_name: undefined,
        };
    }

    private toEntity(domain: CampaingType): CampaingTypeEntity {
        const entity = new CampaingTypeEntity();
        entity.id = domain.id;
        entity.type = domain.type;
        entity.detail = domain.detail;
        entity.state_type_id = domain.state_type_id;
        entity.created_at = domain.created_at;
        entity.updated_at = domain.updated_at;
        entity.responsible = domain.responsible;
        return entity;
    }

    // Crear un nuevo tipo de campaña
    async create(input: CreateCampaingTypeInput): Promise<CampaingType> {
        const now = new Date();
        const entity: Partial<CampaingTypeEntity> = {
            type: input.type,
            detail: input.detail,
            state_type_id: input.state_type_id,
            created_at: input.created_at ?? now,
            updated_at: input.updated_at ?? now,
            responsible: input.responsible,
        };
        const saved = await this.campaingTypeRepository.save(entity as CampaingTypeEntity);
        return this.toDomain(saved);
    }

    // Buscar duplicado por type; devuelve null si no existe
    async findByDuplicate(type: string): Promise<CampaingType | null> {
        const entity = await this.campaingTypeRepository.findOneBy({ type });
        return entity ? this.toDomain(entity) : null;
    }

    // Obtener todos los tipos de campaña (con state_type_name vía JOIN)
    async findAll(): Promise<CampaingType[]> {
        const raw = await this.campaingTypeRepository
            .createQueryBuilder('ct')
            .leftJoin(StateTypeEntity, 'st', 'st.id = ct.state_type_id')
            .select([
                'ct.id',
                'ct.type',
                'ct.detail',
                'ct.state_type_id',
                'ct.created_at',
                'ct.updated_at',
                'ct.responsible',
            ])
            .addSelect('st.type', 'state_type_name')
            .getRawMany();

        return raw.map((row: Record<string, unknown>) => ({
            id: row.ct_id as number,
            type: row.ct_type as string,
            detail: row.ct_detail as string,
            state_type_id: row.ct_state_type_id as number,
            state_type_name: (row.state_type_name as string) ?? '',
            created_at: row.ct_created_at as Date,
            updated_at: row.ct_updated_at as Date,
            responsible: row.ct_responsible as string,
        }));
    }

    // Obtener un tipo de campaña por su id
    async findById(id: number): Promise<CampaingType> {
        const entity = await this.campaingTypeRepository.findOneBy({ id });
        if (!entity) {
            throw new Error('Campaing type not found');
        }
        return this.toDomain(entity);
    }

    // Obtener un tipo de campaña por su type
    async findByType(type: string): Promise<CampaingType> {
        const entity = await this.campaingTypeRepository.findOneBy({ type });
        if (!entity) {
            throw new Error('Campaing type not found');
        }
        return this.toDomain(entity);
    }

    // Actualizar un tipo de campaña
    async update(campaingType: CampaingType): Promise<CampaingType> {
        const entity = this.toEntity(campaingType);
        const saved = await this.campaingTypeRepository.save(entity);
        return this.toDomain(saved);
    }

    // Eliminar un tipo de campaña
    async delete(id: number): Promise<void> {
        await this.campaingTypeRepository.delete(id);
    }
}