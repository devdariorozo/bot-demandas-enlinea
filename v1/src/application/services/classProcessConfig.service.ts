// Responsabilidad: fachada de aplicación que usará el controller.

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClassProcessConfig } from '@domain/entities/classProcessConfig.entities';
import {
  CLASS_PROCESS_CONFIG_REPOSITORY,
  ClassProcessConfigRepository,
  CreateClassProcessConfigInput,
} from '@domain/ports/classProcessConfig.ports';
import { PORTFOLIO_TYPE_REPOSITORY, PortfolioTypeRepository } from '@domain/ports/portfolioType.ports';
import { CAMPaING_TYPE_REPOSITORY, CampaingTypeRepository } from '@domain/ports/campaingType.ports';
import { STATE_TYPE_REPOSITORY, StateTypeRepository } from '@domain/ports/stateType.ports';
import { CLASS_PROCESS_REPOSITORY, ClassProcessRepository } from '@domain/ports/classProcess.ports';
import { PortfolioTypeId } from '@domain/value-objects/portfolioType.valueobjects';
import { CampaingTypeId } from '@domain/value-objects/campaingType.valueobjects';
import { StateTypeId } from '@domain/value-objects/stateType.valueobjects';
import { capitalizeFirstWord } from '@application/utils/string.utils';

@Injectable()
export class ClassProcessConfigService {
  constructor(
    @Inject(CLASS_PROCESS_CONFIG_REPOSITORY)
    private readonly classProcessConfigRepository: ClassProcessConfigRepository,
    @Inject(PORTFOLIO_TYPE_REPOSITORY)
    private readonly portfolioTypeRepository: PortfolioTypeRepository,
    @Inject(CAMPaING_TYPE_REPOSITORY)
    private readonly campaingTypeRepository: CampaingTypeRepository,
    @Inject(STATE_TYPE_REPOSITORY)
    private readonly stateTypeRepository: StateTypeRepository,
    @Inject(CLASS_PROCESS_REPOSITORY)
    private readonly classProcessRepository: ClassProcessRepository,
  ) {}

  async create(input: CreateClassProcessConfigInput): Promise<ClassProcessConfig> {
    try {
      PortfolioTypeId.create(input.portfolio_type_id);
      CampaingTypeId.create(input.campaing_type_id);
      StateTypeId.create(input.state_type_id);
    } catch {
      throw new BadRequestException('portfolio_type_id, campaing_type_id and state_type_id must be positive integers');
    }

    try {
      await this.portfolioTypeRepository.findById(input.portfolio_type_id);
      await this.campaingTypeRepository.findById(input.campaing_type_id);
      await this.stateTypeRepository.findById(input.state_type_id);
    } catch {
      throw new NotFoundException('One or more related records (portfolio, campaing or state) not found');
    }

    if (!input.class_process_ids || input.class_process_ids.length === 0) {
      throw new BadRequestException('At least one class_process_id must be provided');
    }

    for (const cpId of input.class_process_ids) {
      try {
        await this.classProcessRepository.findById(cpId);
      } catch {
        throw new NotFoundException(`Class process with id ${cpId} not found`);
      }
    }

    const existing = (await this.classProcessConfigRepository.findAll()).find(
      (c) =>
        c.portfolio_type_id === input.portfolio_type_id &&
        c.campaing_type_id === input.campaing_type_id,
    );
    if (existing) {
      throw new ConflictException(
        'ClassProcessConfig for this portfolio/campaing combination already exists',
      );
    }

    const normalizedInput = { ...input, detail: capitalizeFirstWord(input.detail) };
    try {
      const created = await this.classProcessConfigRepository.create(normalizedInput);
      return this.enrichWithClassProcessNames(created);
    } catch (error) {
      throw new InternalServerErrorException('Error creating classProcessConfig record');
    }
  }

  async findAll(): Promise<ClassProcessConfig[]> {
    try {
      const list = await this.classProcessConfigRepository.findAll();
      const allClassProcesses = await this.classProcessRepository.findAll();
      const idToName = new Map<number, string>();
      for (const cp of allClassProcesses) {
        idToName.set(cp.id, cp.type);
      }
      return list.map((c) => this.toResponseOrder(c, (c.class_process_ids || []).map((id) => idToName.get(id) ?? '')));
    } catch (error) {
      throw new InternalServerErrorException('Error getting all classProcessConfig records');
    }
  }

  async findByPortfolioAndCampaing(
    portfolio_type_id: number,
    campaing_type_id: number,
  ): Promise<ClassProcessConfig[]> {
    try {
      const list = await this.classProcessConfigRepository.findByPortfolioAndCampaing(
        portfolio_type_id,
        campaing_type_id,
      );
      const allClassProcesses = await this.classProcessRepository.findAll();
      const idToName = new Map<number, string>();
      for (const cp of allClassProcesses) {
        idToName.set(cp.id, cp.type);
      }
      return list.map((c) => this.toResponseOrder(c, (c.class_process_ids || []).map((id) => idToName.get(id) ?? '')));
    } catch (error) {
      throw new InternalServerErrorException(
        'Error getting classProcessConfig by portfolio and campaing',
      );
    }
  }

  async findById(id: number): Promise<ClassProcessConfig> {
    let config: ClassProcessConfig;
    try {
      config = await this.classProcessConfigRepository.findById(id);
    } catch {
      throw new NotFoundException('No data found for the given id');
    }
    return this.enrichWithClassProcessNames(config);
  }

  async update(config: ClassProcessConfig): Promise<ClassProcessConfig> {
    try {
      PortfolioTypeId.create(config.portfolio_type_id);
      CampaingTypeId.create(config.campaing_type_id);
      StateTypeId.create(config.state_type_id);
    } catch {
      throw new BadRequestException('portfolio_type_id, campaing_type_id and state_type_id must be positive integers');
    }

    let existing: ClassProcessConfig;
    try {
      existing = await this.classProcessConfigRepository.findById(config.id);
    } catch {
      throw new NotFoundException('No data found for the given id');
    }

    if (!config.class_process_ids || config.class_process_ids.length === 0) {
      throw new BadRequestException('At least one class_process_id must be provided');
    }

    for (const cpId of config.class_process_ids) {
      try {
        await this.classProcessRepository.findById(cpId);
      } catch {
        throw new NotFoundException(`Class process with id ${cpId} not found`);
      }
    }

    const duplicate = (await this.classProcessConfigRepository.findAll()).find(
      (c) =>
        c.portfolio_type_id === config.portfolio_type_id &&
        c.campaing_type_id === config.campaing_type_id &&
        c.id !== config.id,
    );
    if (duplicate) {
      throw new ConflictException(
        'Another ClassProcessConfig already exists for this portfolio/campaing combination',
      );
    }

    const normalized = { ...config, detail: capitalizeFirstWord(config.detail) };
    const hasChanges =
      existing.portfolio_type_id !== normalized.portfolio_type_id ||
      existing.campaing_type_id !== normalized.campaing_type_id ||
      existing.state_type_id !== normalized.state_type_id ||
      existing.detail !== normalized.detail ||
      existing.responsible !== normalized.responsible ||
      JSON.stringify(existing.class_process_ids || []) !==
        JSON.stringify(normalized.class_process_ids || []);

    if (!hasChanges) {
      throw new BadRequestException('No changes to update');
    }

    try {
      const updated = await this.classProcessConfigRepository.update(normalized);
      return this.enrichWithClassProcessNames(updated);
    } catch (error) {
      throw new InternalServerErrorException('Error updating classProcessConfig record');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.classProcessConfigRepository.findById(id);
    } catch {
      throw new NotFoundException('No data found for the given id');
    }
    try {
      await this.classProcessConfigRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting classProcessConfig record');
    }
  }

  private async enrichWithClassProcessNames(config: ClassProcessConfig): Promise<ClassProcessConfig> {
    const [portfolio, campaing, state] = await Promise.all([
      this.portfolioTypeRepository.findById(config.portfolio_type_id),
      this.campaingTypeRepository.findById(config.campaing_type_id),
      this.stateTypeRepository.findById(config.state_type_id),
    ]);
    const names: string[] = [];
    for (const id of config.class_process_ids || []) {
      try {
        const cp = await this.classProcessRepository.findById(id);
        names.push(cp.type);
      } catch {
        names.push('');
      }
    }
    return this.toResponseOrder(
      {
        ...config,
        portfolio_type_name: portfolio.type,
        campaing_type_name: campaing.type,
        state_type_name: state.type,
      },
      names,
    );
  }

  /** Orden de campos como en dataBases/attentionSchedule: cada _name inmediatamente después de su _id. */
  private toResponseOrder(
    c: ClassProcessConfig & { portfolio_type_name?: string; campaing_type_name?: string; state_type_name?: string },
    class_process_names: string[],
  ): ClassProcessConfig {
    return {
      id: c.id,
      portfolio_type_id: c.portfolio_type_id,
      portfolio_type_name: c.portfolio_type_name ?? '',
      campaing_type_id: c.campaing_type_id,
      campaing_type_name: c.campaing_type_name ?? '',
      class_process_ids: c.class_process_ids ?? [],
      class_process_names,
      detail: c.detail,
      state_type_id: c.state_type_id,
      state_type_name: c.state_type_name ?? '',
      created_at: c.created_at,
      updated_at: c.updated_at,
      responsible: c.responsible,
    };
  }
}
