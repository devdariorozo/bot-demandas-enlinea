// Responsabilidad: fachada de aplicación que usará el controller.

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Departament } from '@domain/entities/departament.entities';
import {
  CreateDepartamentInput,
  DEPARTAMENT_REPOSITORY,
  DepartamentRepository,
} from '@domain/ports/departament.ports';
import { STATE_TYPE_REPOSITORY, StateTypeRepository } from '@domain/ports/stateType.ports';
import { StateTypeId } from '@domain/value-objects/stateType.valueobjects';
import { capitalizeFirstWord } from '@application/utils/string.utils';

@Injectable()
export class DepartamentService {
  constructor(
    @Inject(DEPARTAMENT_REPOSITORY)
    private readonly departamentRepository: DepartamentRepository,
    @Inject(STATE_TYPE_REPOSITORY)
    private readonly stateTypeRepository: StateTypeRepository,
  ) {}

  // Crear un nuevo departamento
  async create(input: CreateDepartamentInput): Promise<Departament> {
    const normalizedName = input.name.trim().toUpperCase();
    const normalizedDetail = capitalizeFirstWord(input.detail);
    const normalizedInput: CreateDepartamentInput = { ...input, name: normalizedName, detail: normalizedDetail };

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

    // Verificar si el nombre de departamento ya existe
    const duplicate = await this.departamentRepository.findByDuplicate(normalizedInput.name);
    if (duplicate) {
      throw new ConflictException('Departament already exists');
    }

    try {
      return await this.departamentRepository.create(normalizedInput);
    } catch (error) {
      throw new InternalServerErrorException('Error creating departament');
    }
  }

  // Obtener todos los departamentos
  async findAll(): Promise<Departament[]> {
    try {
      return await this.departamentRepository.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Error getting all departaments');
    }
  }

  // Obtener un departamento por su id
  async findById(id: number): Promise<Departament> {
    try {
      const dp = await this.departamentRepository.findById(id);
      const state = await this.stateTypeRepository.findById(dp.state_type_id);
      return {
        id: dp.id,
        name: dp.name,
        detail: dp.detail,
        state_type_id: dp.state_type_id,
        state_type_name: state.type,
        created_at: dp.created_at,
        updated_at: dp.updated_at,
        responsible: dp.responsible,
      };
    } catch (error) {
      throw new NotFoundException('No data found for the given id');
    }
  }

  // Obtener un departamento por su nombre
  async findByName(name: string): Promise<Departament> {
    const normalizedName = name.trim().toUpperCase();
    try {
      const dp = await this.departamentRepository.findByName(normalizedName);
      const state = await this.stateTypeRepository.findById(dp.state_type_id);
      return {
        id: dp.id,
        name: dp.name,
        detail: dp.detail,
        state_type_id: dp.state_type_id,
        state_type_name: state.type,
        created_at: dp.created_at,
        updated_at: dp.updated_at,
        responsible: dp.responsible,
      };
    } catch (error) {
      throw new NotFoundException('No data found for the given name');
    }
  }

  // Actualizar un departamento
  async update(input: Departament): Promise<Departament> {
    const normalizedName = input.name.trim().toUpperCase();
    const normalizedDetail = capitalizeFirstWord(input.detail);
    const normalizedInput: Departament = { ...input, name: normalizedName, detail: normalizedDetail };

    // Garantizar que state_type_id sea número entero > 0
    try {
      StateTypeId.create(normalizedInput.state_type_id);
    } catch {
      throw new BadRequestException('state_type_id must be a positive integer');
    }

    let existing: Departament;
    try {
      existing = await this.departamentRepository.findById(normalizedInput.id);
    } catch {
      throw new NotFoundException('No data found for the given id');
    }

    const hasChanges =
      existing.name !== normalizedInput.name ||
      existing.detail !== normalizedInput.detail ||
      existing.state_type_id !== normalizedInput.state_type_id ||
      existing.responsible !== normalizedInput.responsible;

    if (!hasChanges) {
      throw new BadRequestException('No changes to update');
    }

    try {
      return await this.departamentRepository.update(normalizedInput);
    } catch (error) {
      throw new InternalServerErrorException('Error updating departament');
    }
  }

  // Eliminar un departamento
  async delete(id: number): Promise<void> {
    try {
      await this.departamentRepository.findById(id);
    } catch (error) {
      throw new NotFoundException('No data found for the given id');
    }
    try {
      await this.departamentRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting departament');
    }
  }
}

