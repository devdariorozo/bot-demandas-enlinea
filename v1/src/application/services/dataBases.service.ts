// Responsabilidad: fachada de aplicación que usará el controller.

import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DataBases } from '@domain/entities/dataBases.entities';
import { CreateDataBasesInput, DataBasesRepository, DATABASES_REPOSITORY } from '@domain/ports/dataBases.ports';
import { ENVIRONMENT_TYPE_REPOSITORY, EnvironmentTypeRepository } from '@domain/ports/environmentType.ports';
import { PORTFOLIO_TYPE_REPOSITORY, PortfolioTypeRepository } from '@domain/ports/portfolioType.ports';
import { CAMPaING_TYPE_REPOSITORY, CampaingTypeRepository } from '@domain/ports/campaingType.ports';
import { STATE_TYPE_REPOSITORY, StateTypeRepository } from '@domain/ports/stateType.ports';
import { EnvironmentTypeId } from '@domain/value-objects/environmentType.valueobjects';
import { PortfolioTypeId } from '@domain/value-objects/portfolioType.valueobjects';
import { CampaingTypeId } from '@domain/value-objects/campaingType.valueobjects';
import { StateTypeId } from '@domain/value-objects/stateType.valueobjects';
import { capitalizeFirstWord } from '@application/utils/string.utils';

@Injectable()
export class DataBasesService {
  constructor(
    @Inject(DATABASES_REPOSITORY)
    private readonly dataBasesRepository: DataBasesRepository,
    @Inject(ENVIRONMENT_TYPE_REPOSITORY)
    private readonly environmentTypeRepository: EnvironmentTypeRepository,
    @Inject(PORTFOLIO_TYPE_REPOSITORY)
    private readonly portfolioTypeRepository: PortfolioTypeRepository,
    @Inject(CAMPaING_TYPE_REPOSITORY)
    private readonly campaingTypeRepository: CampaingTypeRepository,
    @Inject(STATE_TYPE_REPOSITORY)
    private readonly stateTypeRepository: StateTypeRepository,
  ) {}

  // Crear un nuevo registro de bases
  async create(input: CreateDataBasesInput): Promise<DataBases> {
    // Validar que los IDs sean enteros positivos
    try {
      EnvironmentTypeId.create(input.environment_type_id);
      PortfolioTypeId.create(input.portfolio_type_id);
      CampaingTypeId.create(input.campaing_type_id);
      StateTypeId.create(input.state_type_id);
    } catch {
      throw new BadRequestException('All foreign keys must be positive integers');
    }

    // Validar que existan en BD
    try {
      await this.environmentTypeRepository.findById(input.environment_type_id);
      await this.portfolioTypeRepository.findById(input.portfolio_type_id);
      await this.campaingTypeRepository.findById(input.campaing_type_id);
      await this.stateTypeRepository.findById(input.state_type_id);
    } catch {
      throw new NotFoundException('One or more related records not found');
    }

    // Validar que bases no sea vacío
    if (!input.bases || input.bases.length === 0) {
      throw new BadRequestException('At least one base must be provided');
    }

    // Opcional: evitar duplicados por combinación environment/portfolio/campaing
    const existing = (await this.dataBasesRepository.findAll()).find(
      (db) =>
        db.environment_type_id === input.environment_type_id &&
        db.portfolio_type_id === input.portfolio_type_id &&
        db.campaing_type_id === input.campaing_type_id,
    );
    if (existing) {
      throw new ConflictException('DataBases record for this environment/portfolio/campaing already exists');
    }

    const normalizedInput = { ...input, detail: capitalizeFirstWord(input.detail) };
    try {
      return await this.dataBasesRepository.create(normalizedInput);
    } catch (error) {
      throw new InternalServerErrorException('Error creating dataBases record');
    }
  }

  // Obtener todos los registros de bases
  async findAll(): Promise<DataBases[]> {
    try {
      return await this.dataBasesRepository.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Error getting all dataBases records');
    }
  }

  // Obtener registros de bases por combinación entorno/cartera/campaña
  async findByEnvAndPortfAndCamp(
    environment_type_id: number,
    portfolio_type_id: number,
    campaing_type_id: number,
  ): Promise<DataBases[]> {
    try {
      const all = await this.dataBasesRepository.findAll();
      return all.filter(
        (db) =>
          db.environment_type_id === environment_type_id &&
          db.portfolio_type_id === portfolio_type_id &&
          db.campaing_type_id === campaing_type_id,
      );
    } catch (error) {
      throw new InternalServerErrorException('Error getting dataBases by environment, portfolio and campaing');
    }
  }

  // Obtener un registro de bases por su id
  async findById(id: number): Promise<DataBases> {
    try {
      const db = await this.dataBasesRepository.findById(id);
      const [env, portfolio, campaing, state] = await Promise.all([
        this.environmentTypeRepository.findById(db.environment_type_id),
        this.portfolioTypeRepository.findById(db.portfolio_type_id),
        this.campaingTypeRepository.findById(db.campaing_type_id),
        this.stateTypeRepository.findById(db.state_type_id),
      ]);

      return {
        id: db.id,
        environment_type_id: db.environment_type_id,
        environment_type_name: env.type,
        portfolio_type_id: db.portfolio_type_id,
        portfolio_type_name: portfolio.type,
        campaing_type_id: db.campaing_type_id,
        campaing_type_name: campaing.type,
        bases: db.bases,
        detail: db.detail,
        state_type_id: db.state_type_id,
        state_type_name: state.type,
        created_at: db.created_at,
        updated_at: db.updated_at,
        responsible: db.responsible,
      };
    } catch (error) {
      throw new NotFoundException('No data found for the given id');
    }
  }

  // Actualizar un registro de bases
  async update(dataBases: DataBases): Promise<DataBases> {
    // Validar que los IDs sean enteros positivos
    try {
      EnvironmentTypeId.create(dataBases.environment_type_id);
      PortfolioTypeId.create(dataBases.portfolio_type_id);
      CampaingTypeId.create(dataBases.campaing_type_id);
      StateTypeId.create(dataBases.state_type_id);
    } catch {
      throw new BadRequestException('All foreign keys must be positive integers');
    }

    let existing: DataBases;
    try {
      existing = await this.dataBasesRepository.findById(dataBases.id);
    } catch {
      throw new NotFoundException('No data found for the given id');
    }

    const normalized = { ...dataBases, detail: capitalizeFirstWord(dataBases.detail) };
    const hasChanges =
      existing.environment_type_id !== normalized.environment_type_id ||
      existing.portfolio_type_id !== normalized.portfolio_type_id ||
      existing.campaing_type_id !== normalized.campaing_type_id ||
      existing.state_type_id !== normalized.state_type_id ||
      existing.detail !== normalized.detail ||
      existing.responsible !== normalized.responsible ||
      JSON.stringify(existing.bases) !== JSON.stringify(normalized.bases);

    if (!hasChanges) {
      throw new BadRequestException('No changes to update');
    }

    try {
      return await this.dataBasesRepository.update(normalized);
    } catch (error) {
      throw new InternalServerErrorException('Error updating dataBases record');
    }
  }

  // Eliminar un registro de bases
  async delete(id: number): Promise<void> {
    try {
      await this.dataBasesRepository.findById(id);
    } catch (error) {
      throw new NotFoundException('No data found for the given id');
    }
    try {
      await this.dataBasesRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting dataBases record');
    }
  }
}

