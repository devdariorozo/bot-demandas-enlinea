// Responsabilidad: fachada de aplicación que usará el controller.

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { City } from '@domain/entities/city.entities';
import {
  CITY_REPOSITORY,
  CityRepository,
  CreateCityInput,
} from '@domain/ports/city.ports';
import { DEPARTAMENT_REPOSITORY, DepartamentRepository } from '@domain/ports/departament.ports';
import { STATE_TYPE_REPOSITORY, StateTypeRepository } from '@domain/ports/stateType.ports';
import { StateTypeId } from '@domain/value-objects/stateType.valueobjects';
import { capitalizeFirstWord } from '@application/utils/string.utils';

@Injectable()
export class CityService {
  constructor(
    @Inject(CITY_REPOSITORY)
    private readonly cityRepository: CityRepository,
    @Inject(DEPARTAMENT_REPOSITORY)
    private readonly departamentRepository: DepartamentRepository,
    @Inject(STATE_TYPE_REPOSITORY)
    private readonly stateTypeRepository: StateTypeRepository,
  ) {}

  // Crear una nueva ciudad
  async create(input: CreateCityInput): Promise<City> {
    const normalizedName = input.name.trim().toUpperCase();
    const normalizedDetail = capitalizeFirstWord(input.detail);
    const normalizedInput: CreateCityInput = { ...input, name: normalizedName, detail: normalizedDetail };

    // Validar que departament_id y state_type_id sean enteros positivos
    const departamentId = Number(normalizedInput.departament_id);
    if (!Number.isInteger(departamentId) || departamentId <= 0) {
      throw new BadRequestException('departament_id must be a positive integer');
    }
    try {
      StateTypeId.create(normalizedInput.state_type_id);
    } catch {
      throw new BadRequestException('state_type_id must be a positive integer');
    }

    // Validar existencia de departamento y estado
    try {
      await this.departamentRepository.findById(departamentId);
      await this.stateTypeRepository.findById(normalizedInput.state_type_id);
    } catch {
      throw new NotFoundException('Departament or state type not found');
    }

    // Evitar duplicados por nombre + departamento
    const duplicate = await this.cityRepository.findByDuplicate(normalizedInput.name, departamentId);
    if (duplicate) {
      throw new ConflictException('City already exists in this departament');
    }

    try {
      return await this.cityRepository.create({ ...normalizedInput, departament_id: departamentId });
    } catch (error) {
      throw new InternalServerErrorException('Error creating city');
    }
  }

  // Obtener todas las ciudades
  async findAll(): Promise<City[]> {
    try {
      return await this.cityRepository.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Error getting all cities');
    }
  }

  // Obtener una ciudad por su id
  async findById(id: number): Promise<City> {
    try {
      const city = await this.cityRepository.findById(id);
      const [departament, state] = await Promise.all([
        this.departamentRepository.findById(city.departament_id),
        this.stateTypeRepository.findById(city.state_type_id),
      ]);
      return {
        id: city.id,
        departament_id: city.departament_id,
        departament_name: departament.name,
        name: city.name,
        detail: city.detail,
        state_type_id: city.state_type_id,
        state_type_name: state.type,
        created_at: city.created_at,
        updated_at: city.updated_at,
        responsible: city.responsible,
      };
    } catch (error) {
      throw new NotFoundException('No data found for the given id');
    }
  }

  // Obtener ciudades por departamento
  async findByDepartament(departament_id: number): Promise<City[]> {
    try {
      await this.departamentRepository.findById(departament_id);
    } catch {
      throw new NotFoundException('Departament not found');
    }
    try {
      return await this.cityRepository.findByDepartament(departament_id);
    } catch (error) {
      throw new InternalServerErrorException('Error getting cities by departament');
    }
  }

  // Actualizar una ciudad
  async update(input: City): Promise<City> {
    const normalizedName = input.name.trim().toUpperCase();
    const normalizedDetail = capitalizeFirstWord(input.detail);
    const normalizedInput: City = { ...input, name: normalizedName, detail: normalizedDetail };

    const departamentId = Number(normalizedInput.departament_id);
    if (!Number.isInteger(departamentId) || departamentId <= 0) {
      throw new BadRequestException('departament_id must be a positive integer');
    }
    try {
      StateTypeId.create(normalizedInput.state_type_id);
    } catch {
      throw new BadRequestException('state_type_id must be a positive integer');
    }

    let existing: City;
    try {
      existing = await this.cityRepository.findById(normalizedInput.id);
    } catch {
      throw new NotFoundException('No data found for the given id');
    }

    const hasChanges =
      existing.name !== normalizedInput.name ||
      existing.detail !== normalizedInput.detail ||
      existing.departament_id !== departamentId ||
      existing.state_type_id !== normalizedInput.state_type_id ||
      existing.responsible !== normalizedInput.responsible;

    if (!hasChanges) {
      throw new BadRequestException('No changes to update');
    }

    try {
      return await this.cityRepository.update({ ...normalizedInput, departament_id: departamentId });
    } catch (error) {
      throw new InternalServerErrorException('Error updating city');
    }
  }

  // Eliminar una ciudad
  async delete(id: number): Promise<void> {
    try {
      await this.cityRepository.findById(id);
    } catch {
      throw new NotFoundException('No data found for the given id');
    }
    try {
      await this.cityRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting city');
    }
  }
}

