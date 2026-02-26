// Responsabilidad: fachada de aplicación que usará el controller.

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SpecialtyProcess } from '@domain/entities/specialtyProcess.entities';
import {
  CreateSpecialtyProcessInput,
  SPECIALTY_PROCESS_REPOSITORY,
  SpecialtyProcessRepository,
} from '@domain/ports/specialtyProcess.ports';
import { STATE_TYPE_REPOSITORY, StateTypeRepository } from '@domain/ports/stateType.ports';
import { StateTypeId } from '@domain/value-objects/stateType.valueobjects';
import { capitalizeFirstWord } from '@application/utils/string.utils';

@Injectable()
export class SpecialtyProcessService {
  constructor(
    @Inject(SPECIALTY_PROCESS_REPOSITORY)
    private readonly specialtyProcessRepository: SpecialtyProcessRepository,
    @Inject(STATE_TYPE_REPOSITORY)
    private readonly stateTypeRepository: StateTypeRepository,
  ) {}

  // Crear una nueva especialidad de proceso (type siempre en mayúsculas)
  async create(input: CreateSpecialtyProcessInput): Promise<SpecialtyProcess> {
    const normalizedType = input.type.trim().toUpperCase();
    const normalizedDetail = capitalizeFirstWord(input.detail);
    const normalizedInput: CreateSpecialtyProcessInput = {
      ...input,
      type: normalizedType,
      detail: normalizedDetail,
    };

    // 1) garantizar que state_type_id sea número entero > 0
    try {
      StateTypeId.create(normalizedInput.state_type_id);
    } catch {
      throw new BadRequestException('state_type_id must be a positive integer');
    }

    // 2) validar que exista en BD
    try {
      await this.stateTypeRepository.findById(normalizedInput.state_type_id);
    } catch {
      throw new NotFoundException('No data found for the given state type id');
    }

    // 3) validar unicidad solo para registros activos (state_type "Active")
    const duplicateActive = await this.specialtyProcessRepository.findActiveDuplicate(normalizedInput.type);
    if (duplicateActive) {
      throw new ConflictException('Specialty process type already exists in active state');
    }

    try {
      return await this.specialtyProcessRepository.create(normalizedInput);
    } catch (error) {
      throw new InternalServerErrorException('Error creating specialty process');
    }
  }

  // Obtener todas las especialidades
  async findAll(): Promise<SpecialtyProcess[]> {
    try {
      return await this.specialtyProcessRepository.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Error getting all specialty processes');
    }
  }

  // Obtener una especialidad por su id
  async findById(id: number): Promise<SpecialtyProcess> {
    try {
      const sp = await this.specialtyProcessRepository.findById(id);
      const state = await this.stateTypeRepository.findById(sp.state_type_id);
      return {
        id: sp.id,
        type: sp.type,
        detail: sp.detail,
        state_type_id: sp.state_type_id,
        state_type_name: state.type,
        created_at: sp.created_at,
        updated_at: sp.updated_at,
        responsible: sp.responsible,
      };
    } catch (error) {
      throw new NotFoundException('No data found for the given id');
    }
  }

  // Obtener una especialidad por su type
  async findByType(type: string): Promise<SpecialtyProcess> {
    try {
      const sp = await this.specialtyProcessRepository.findByType(type);
      const state = await this.stateTypeRepository.findById(sp.state_type_id);
      return {
        id: sp.id,
        type: sp.type,
        detail: sp.detail,
        state_type_id: sp.state_type_id,
        state_type_name: state.type,
        created_at: sp.created_at,
        updated_at: sp.updated_at,
        responsible: sp.responsible,
      };
    } catch (error) {
      throw new NotFoundException('No data found for the given type');
    }
  }

  // Actualizar una especialidad de proceso (type siempre en mayúsculas)
  async update(input: SpecialtyProcess): Promise<SpecialtyProcess> {
    const normalizedType = input.type.trim().toUpperCase();
    const normalizedDetail = capitalizeFirstWord(input.detail);
    const normalizedInput: SpecialtyProcess = {
      ...input,
      type: normalizedType,
      detail: normalizedDetail,
    };

    // Garantizar que state_type_id sea número entero > 0
    try {
      StateTypeId.create(normalizedInput.state_type_id);
    } catch {
      throw new BadRequestException('state_type_id must be a positive integer');
    }

    let existing: SpecialtyProcess;
    try {
      existing = await this.specialtyProcessRepository.findById(normalizedInput.id);
    } catch {
      throw new NotFoundException('No data found for the given id');
    }

    const hasChanges =
      existing.type !== normalizedInput.type ||
      existing.detail !== normalizedInput.detail ||
      existing.state_type_id !== normalizedInput.state_type_id ||
      existing.responsible !== normalizedInput.responsible;

    if (!hasChanges) {
      throw new BadRequestException('No changes to update');
    }

    // Si el registro quedará activo, validar unicidad por type en activos (excluyendo este id)
    if (normalizedInput.state_type_id === 1) {
      const duplicateActive = await this.specialtyProcessRepository.findActiveDuplicate(normalizedInput.type);
      if (duplicateActive && duplicateActive.id !== normalizedInput.id) {
        throw new ConflictException('Specialty process type already exists in active state');
      }
    }

    try {
      return await this.specialtyProcessRepository.update(normalizedInput);
    } catch (error) {
      throw new InternalServerErrorException('Error updating specialty process');
    }
  }

  // Eliminar una especialidad
  async delete(id: number): Promise<void> {
    try {
      await this.specialtyProcessRepository.findById(id);
    } catch {
      throw new NotFoundException('No data found for the given id');
    }
    try {
      await this.specialtyProcessRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting specialty process');
    }
  }
}

