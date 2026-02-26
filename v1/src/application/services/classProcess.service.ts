// Responsabilidad: fachada de aplicación con validaciones de negocio para class_process.

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClassProcess } from '@domain/entities/classProcess.entities';
import {
  CreateClassProcessInput,
  CLASS_PROCESS_REPOSITORY,
  ClassProcessRepository,
} from '@domain/ports/classProcess.ports';
import { STATE_TYPE_REPOSITORY, StateTypeRepository } from '@domain/ports/stateType.ports';
import { SPECIALTY_PROCESS_REPOSITORY, SpecialtyProcessRepository } from '@domain/ports/specialtyProcess.ports';
import { StateTypeId } from '@domain/value-objects/stateType.valueobjects';
import { ClassProcessSpecialtyId } from '@domain/value-objects/classProcess.valueobjects';
import { StateType } from '@domain/value-objects/stateType.valueobjects';
import { capitalizeFirstWord } from '@application/utils/string.utils';

@Injectable()
export class ClassProcessService {
  constructor(
    @Inject(CLASS_PROCESS_REPOSITORY)
    private readonly classProcessRepository: ClassProcessRepository,
    @Inject(STATE_TYPE_REPOSITORY)
    private readonly stateTypeRepository: StateTypeRepository,
    @Inject(SPECIALTY_PROCESS_REPOSITORY)
    private readonly specialtyProcessRepository: SpecialtyProcessRepository,
  ) {}

  async create(input: CreateClassProcessInput): Promise<ClassProcess> {
    const normalizedType = input.type.trim().toUpperCase();
    const normalizedDetail = capitalizeFirstWord(input.detail);
    const normalizedInput: CreateClassProcessInput = {
      ...input,
      type: normalizedType,
      detail: normalizedDetail,
    };

    try {
      StateTypeId.create(normalizedInput.state_type_id);
    } catch {
      throw new BadRequestException('state_type_id must be a positive integer');
    }
    try {
      ClassProcessSpecialtyId.create(normalizedInput.specialty_process_id);
    } catch {
      throw new BadRequestException('specialty_process_id must be a positive integer');
    }

    const stateType = await this.stateTypeRepository.findById(normalizedInput.state_type_id);
    const specialty = await this.specialtyProcessRepository.findById(normalizedInput.specialty_process_id);

    const activeState = await this.stateTypeRepository.findByType(StateType.ACTIVE);
    if (specialty.state_type_id !== activeState.id) {
      throw new BadRequestException('Cannot associate class process to inactive specialties');
    }

    const duplicate = await this.classProcessRepository.findActiveDuplicate(
      normalizedInput.specialty_process_id,
      normalizedInput.type,
    );
    if (duplicate) {
      throw new ConflictException(
        'An active class process with the same type already exists for this specialty',
      );
    }

    try {
      return await this.classProcessRepository.create(normalizedInput);
    } catch {
      throw new InternalServerErrorException('Error creating class process');
    }
  }

  async findAll(): Promise<ClassProcess[]> {
    try {
      return await this.classProcessRepository.findAll();
    } catch {
      throw new InternalServerErrorException('Error getting all class processes');
    }
  }

  async findById(id: number): Promise<ClassProcess> {
    let cp: ClassProcess;
    try {
      cp = await this.classProcessRepository.findById(id);
    } catch {
      throw new NotFoundException('No data found for the given id');
    }
    const state = await this.stateTypeRepository.findById(cp.state_type_id);
    const specialty = await this.specialtyProcessRepository.findById(cp.specialty_process_id);
    return {
      ...cp,
      state_type_name: state.type,
      specialty_process_name: specialty.type,
    };
  }

  /** Catálogo por especialidad (para otros módulos). */
  async findBySpecialtyId(specialtyProcessId: number): Promise<ClassProcess[]> {
    try {
      ClassProcessSpecialtyId.create(specialtyProcessId);
    } catch {
      throw new BadRequestException('specialty_process_id must be a positive integer');
    }
    try {
      return await this.classProcessRepository.findBySpecialtyId(specialtyProcessId);
    } catch {
      throw new InternalServerErrorException('Error getting class processes by specialty');
    }
  }

  async update(input: ClassProcess): Promise<ClassProcess> {
    const normalizedType = input.type.trim().toUpperCase();
    const normalizedDetail = capitalizeFirstWord(input.detail);
    const normalizedInput: ClassProcess = {
      ...input,
      type: normalizedType,
      detail: normalizedDetail,
    };

    try {
      StateTypeId.create(normalizedInput.state_type_id);
    } catch {
      throw new BadRequestException('state_type_id must be a positive integer');
    }
    try {
      ClassProcessSpecialtyId.create(normalizedInput.specialty_process_id);
    } catch {
      throw new BadRequestException('specialty_process_id must be a positive integer');
    }

    let existing: ClassProcess;
    try {
      existing = await this.classProcessRepository.findById(normalizedInput.id);
    } catch {
      throw new NotFoundException('No data found for the given id');
    }

    const activeState = await this.stateTypeRepository.findByType(StateType.ACTIVE);
    if (normalizedInput.specialty_process_id !== existing.specialty_process_id) {
      const specialty = await this.specialtyProcessRepository.findById(normalizedInput.specialty_process_id);
      if (specialty.state_type_id !== activeState.id) {
        throw new BadRequestException('Cannot associate class process to inactive specialties');
      }
    }

    const hasChanges =
      existing.specialty_process_id !== normalizedInput.specialty_process_id ||
      existing.type !== normalizedInput.type ||
      existing.detail !== normalizedInput.detail ||
      existing.state_type_id !== normalizedInput.state_type_id ||
      existing.responsible !== normalizedInput.responsible;
    if (!hasChanges) {
      throw new BadRequestException('No changes to update');
    }

    if (normalizedInput.state_type_id === activeState.id) {
      const duplicate = await this.classProcessRepository.findActiveDuplicate(
        normalizedInput.specialty_process_id,
        normalizedInput.type,
        normalizedInput.id,
      );
      if (duplicate) {
        throw new ConflictException(
          'An active class process with the same type already exists for this specialty',
        );
      }
    }

    try {
      return await this.classProcessRepository.update(normalizedInput);
    } catch {
      throw new InternalServerErrorException('Error updating class process');
    }
  }

  /** Inactivar: actualizar state_type_id a Inactive. Eliminar: borrado físico. */
  async delete(id: number): Promise<void> {
    try {
      await this.classProcessRepository.findById(id);
    } catch {
      throw new NotFoundException('No data found for the given id');
    }
    try {
      await this.classProcessRepository.delete(id);
    } catch {
      throw new InternalServerErrorException('Error deleting class process');
    }
  }
}
