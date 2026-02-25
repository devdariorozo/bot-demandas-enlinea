// Responsabilidad: implementación concreta de StateTypeRepository con TypeORM.

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateStateTypeInput, StateTypeRepository } from '@domain/ports/stateType.ports';
import { StateTypeEntity } from '../entities/stateType.entities';
import { DataSource, Repository } from 'typeorm';
import { StateType } from '@domain/entities/stateType.entities';

@Injectable()
export class StateTypeRepositoryImpl implements StateTypeRepository {
    private readonly stateTypeRepository: Repository<StateTypeEntity>;

    constructor(@InjectDataSource() dataSource: DataSource) {
        this.stateTypeRepository = dataSource.getRepository(StateTypeEntity);
    }
    // Crear un nuevo tipo de estado
    async create(stateType: CreateStateTypeInput): Promise<StateType> {
        const now = new Date();
        const entity: Partial<StateTypeEntity> = {
            ...stateType,
            created_at: stateType.created_at ?? now,
            updated_at: stateType.updated_at ?? now,
        };
        const saved = await this.stateTypeRepository.save(entity as StateTypeEntity);
        return saved;
    }
    // Buscar duplicado por type; devuelve null si no existe
    async findByDuplicate(type: string): Promise<StateType | null> {
        const stateType = await this.stateTypeRepository.findOneBy({ type });
        return stateType ?? null;
    }
        // Obtener todos los tipos de estado
        async findAll(): Promise<StateType[]> {
            return this.stateTypeRepository.find();
    }
    // Obtener un tipo de estado por su id
    async findById(id: number): Promise<StateType> {
        const stateType = await this.stateTypeRepository.findOneBy({ id });
        if (!stateType) {
            throw new Error('State type not found');
        }
        return stateType;
    }
    // Obtener un tipo de estado por su type
    async findByType(type: string): Promise<StateType> {
        const stateType = await this.stateTypeRepository.findOneBy({ type });
        if (!stateType) {
            throw new Error('State type not found');
        }
        return stateType;
    }
    // Actualizar un tipo de estado
    async update(stateType: StateType): Promise<StateType> {
        return this.stateTypeRepository.save(stateType);
    }
    // Eliminar un tipo de estado
    async delete(id: number): Promise<void> {
        await this.stateTypeRepository.delete(id);
    }
}