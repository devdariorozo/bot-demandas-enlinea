// Responsabilidad: fachada de aplicación que usará el controller de CampaingType.

import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { CampaingType } from '@domain/entities/campaingType.entities';
import { CAMPaING_TYPE_REPOSITORY, CampaingTypeRepository, CreateCampaingTypeInput } from '@domain/ports/campaingType.ports';
import { STATE_TYPE_REPOSITORY, StateTypeRepository } from '@domain/ports/stateType.ports';
import { StateTypeId } from '@domain/value-objects/stateType.valueobjects';
import { capitalizeFirstWord } from '@application/utils/string.utils';

@Injectable()
export class CampaingTypeService {
    constructor(
        @Inject(CAMPaING_TYPE_REPOSITORY)
        private readonly campaingTypeRepository: CampaingTypeRepository,
        @Inject(STATE_TYPE_REPOSITORY)
        private readonly stateTypeRepository: StateTypeRepository,
    ) {}

    // Crear un nuevo tipo de campaña
    async create(campaingType: CreateCampaingTypeInput): Promise<CampaingType> {
        // 1) garantizar que state_type_id sea número entero > 0
        try {
            StateTypeId.create(campaingType.state_type_id);
        } catch {
            throw new BadRequestException('state_type_id must be a positive integer');
        }
        // 2) validar que exista en BD
        try {
            await this.stateTypeRepository.findById(campaingType.state_type_id);
        } catch {
            throw new NotFoundException('No data found for the given state type id');
        }

        // Verificar si el tipo de campaña ya existe
        const duplicate = await this.campaingTypeRepository.findByDuplicate(campaingType.type);

        if (duplicate) {
            throw new ConflictException('Campaing type already exists');
        }

        try {
            return await this.campaingTypeRepository.create(campaingType);
        } catch (error) {
            throw new InternalServerErrorException('Error creating campaing type');
        }
    }

    // Obtener todos los tipos de campaña
    async findAll(): Promise<CampaingType[]> {
        try {
            return await this.campaingTypeRepository.findAll();
        } catch (error) {
            throw new InternalServerErrorException('Error getting all campaing types');
        }
    }

    // Obtener un tipo de campaña por su id
    async findById(id: number): Promise<CampaingType> {
        try {
            const campaing = await this.campaingTypeRepository.findById(id);
            const stateType = await this.stateTypeRepository.findById(campaing.state_type_id);
            return {
                id: campaing.id,
                type: campaing.type,
                state_type_id: campaing.state_type_id,
                state_type_name: stateType.type,
                detail: campaing.detail,
                created_at: campaing.created_at,
                updated_at: campaing.updated_at,
                responsible: campaing.responsible,
            };
        } catch (error) {
            throw new NotFoundException('No data found for the given id');
        }
    }

    // Obtener un tipo de campaña por su type
    async findByType(type: string): Promise<CampaingType> {
        try {
            const campaing = await this.campaingTypeRepository.findByType(type);
            const stateType = await this.stateTypeRepository.findById(campaing.state_type_id);
            return {
                id: campaing.id,
                type: campaing.type,
                state_type_id: campaing.state_type_id,
                state_type_name: stateType.type,
                detail: campaing.detail,
                created_at: campaing.created_at,
                updated_at: campaing.updated_at,
                responsible: campaing.responsible,
            };
        } catch (error) {
            throw new NotFoundException('No data found for the given type');
        }
    }

    // Actualizar un tipo de campaña
    async update(campaingType: CampaingType): Promise<CampaingType> {
        // Garantizar que state_type_id sea número entero > 0
        try {
            StateTypeId.create(campaingType.state_type_id);
        } catch {
            throw new BadRequestException('state_type_id must be a positive integer');
        }

        let existing: CampaingType;
        try {
            existing = await this.campaingTypeRepository.findById(campaingType.id);
        } catch {
            throw new NotFoundException('No data found for the given id');
        }

        const normalized = { ...campaingType, detail: capitalizeFirstWord(campaingType.detail) };
        const hasChanges =
            existing.type !== normalized.type ||
            existing.detail !== normalized.detail ||
            existing.state_type_id !== normalized.state_type_id ||
            existing.responsible !== normalized.responsible;

        if (!hasChanges) {
            throw new BadRequestException('No changes to update');
        }

        try {
            return await this.campaingTypeRepository.update(normalized); // solo se ejecuta cuando SÍ hay cambios
        } catch (error) {
            throw new InternalServerErrorException('Error updating campaing type');
        }
    }

    // Eliminar un tipo de campaña
    async delete(id: number): Promise<void> {
        try {
            await this.campaingTypeRepository.findById(id);
        } catch (error) {
            throw new NotFoundException('No data found for the given id');
        }
        try {
            await this.campaingTypeRepository.delete(id);
        } catch (error) {
            throw new InternalServerErrorException('Error deleting campaing type');
        }
    }
}

