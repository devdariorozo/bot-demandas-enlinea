// Responsabilidad: fachada de aplicación que usará el controller para amount_type.

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { AmountType } from '@domain/entities/amountType.entities';
import { AMOUNT_TYPE_REPOSITORY, AmountTypeRepository, CreateAmountTypeInput } from '@domain/ports/amountType.ports';
import { STATE_TYPE_REPOSITORY, StateTypeRepository } from '@domain/ports/stateType.ports';
import { StateTypeId } from '@domain/value-objects/stateType.valueobjects';
import { capitalizeFirstWord } from '@application/utils/string.utils';

@Injectable()
export class AmountTypeService {
  constructor(
    @Inject(AMOUNT_TYPE_REPOSITORY)
    private readonly amountTypeRepository: AmountTypeRepository,
    @Inject(STATE_TYPE_REPOSITORY)
    private readonly stateTypeRepository: StateTypeRepository,
  ) {}

  // Crear un nuevo tipo de cuantía
  async create(input: CreateAmountTypeInput): Promise<AmountType> {
    // 1) validar state_type_id
    try {
      StateTypeId.create(input.state_type_id);
    } catch {
      throw new BadRequestException('state_type_id debe ser un número entero positivo');
    }

    // 2) validar existencia en BD
    try {
      await this.stateTypeRepository.findById(input.state_type_id);
    } catch {
      throw new NotFoundException('No se encontraron datos para el tipo de estado indicado');
    }

    // 3) evitar duplicados por type
    const duplicate = await this.amountTypeRepository.findByDuplicate(input.type);
    if (duplicate) {
      throw new ConflictException('Ya existe un tipo de cuantía con ese nombre');
    }

    const normalized: CreateAmountTypeInput = {
      ...input,
      detail: capitalizeFirstWord(input.detail),
    };

    try {
      return await this.amountTypeRepository.create(normalized);
    } catch {
      throw new InternalServerErrorException('Error al crear el tipo de cuantía');
    }
  }

  // Obtener todos los tipos de cuantía
  async findAll(): Promise<AmountType[]> {
    try {
      return await this.amountTypeRepository.findAll();
    } catch {
      throw new InternalServerErrorException('Error al obtener los tipos de cuantía');
    }
  }

  // Obtener un tipo de cuantía por su id
  async findById(id: number): Promise<AmountType> {
    try {
      const amount = await this.amountTypeRepository.findById(id);
      const stateType = await this.stateTypeRepository.findById(amount.state_type_id);
      return {
        id: amount.id,
        type: amount.type,
        specialty_process: amount.specialty_process,
        class_process: amount.class_process,
        detail: amount.detail,
        state_type_id: amount.state_type_id,
        state_type_name: stateType.type,
        created_at: amount.created_at,
        updated_at: amount.updated_at,
        responsible: amount.responsible,
      };
    } catch {
      throw new NotFoundException('No se encontraron datos para el id indicado');
    }
  }

  // Actualizar un tipo de cuantía
  async update(amountType: AmountType): Promise<AmountType> {
    // validar state_type_id
    try {
      StateTypeId.create(amountType.state_type_id);
    } catch {
      throw new BadRequestException('state_type_id debe ser un número entero positivo');
    }

    let existing: AmountType;
    try {
      existing = await this.amountTypeRepository.findById(amountType.id);
    } catch {
      throw new NotFoundException('No se encontraron datos para el id indicado');
    }

    const normalized: AmountType = {
      ...amountType,
      detail: capitalizeFirstWord(amountType.detail),
    };

    const hasChanges =
      existing.type !== normalized.type ||
      existing.specialty_process !== normalized.specialty_process ||
      existing.class_process !== normalized.class_process ||
      existing.detail !== normalized.detail ||
      existing.state_type_id !== normalized.state_type_id ||
      existing.responsible !== normalized.responsible;

    if (!hasChanges) {
      throw new BadRequestException('No hay cambios para actualizar');
    }

    // Si se cambia el type, verificar que no exista ya en otro registro
    if (existing.type !== normalized.type) {
      const duplicate = await this.amountTypeRepository.findByDuplicate(normalized.type);
      if (duplicate && duplicate.id !== amountType.id) {
        throw new ConflictException('Ya existe otro tipo de cuantía con ese nombre');
      }
    }

    try {
      return await this.amountTypeRepository.update(normalized);
    } catch {
      throw new InternalServerErrorException('Error al actualizar el tipo de cuantía');
    }
  }

  // Eliminar un tipo de cuantía
  async delete(id: number): Promise<void> {
    try {
      await this.amountTypeRepository.findById(id);
    } catch {
      throw new NotFoundException('No se encontraron datos para el id indicado');
    }

    try {
      await this.amountTypeRepository.delete(id);
    } catch {
      throw new InternalServerErrorException('Error al eliminar el tipo de cuantía');
    }
  }
}

