import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ConfigDataBasesRepositoryPort,
  CONFIG_DATA_BASES_REPOSITORY,
} from '../../domain/ports/config-data-bases.repository.port';
import { ConfigDataBases } from '../../domain/entities/config-data-bases.interface';
import { CreateConfigDataBasesDto } from '../../interfaces/http/dto/config-data-bases';
import { UpdateConfigDataBasesDto } from '../../interfaces/http/dto/config-data-bases';

@Injectable()
export class ConfigDataBasesService {
  constructor(
    @Inject(CONFIG_DATA_BASES_REPOSITORY)
    private readonly repository: ConfigDataBasesRepositoryPort,
  ) {}

  async create(dto: CreateConfigDataBasesDto): Promise<ConfigDataBases> {
    return this.repository.create({
      ...dto,
      state_type: dto.state_type ?? 1,
    });
  }

  async findAll(filters?: {
    environment?: string;
    portfolio_type?: string;
    campaign?: string;
    state_type?: number;
  }): Promise<ConfigDataBases[]> {
    return this.repository.findAll(filters);
  }

  async findOne(id: number): Promise<ConfigDataBases> {
    const found = await this.repository.findById(id);
    if (!found) {
      throw new NotFoundException(`Configuración de bases de datos con id ${id} no encontrada`);
    }
    return found;
  }

  async update(
    id: number,
    dto: UpdateConfigDataBasesDto,
  ): Promise<ConfigDataBases> {
    const exists = await this.repository.findById(id);
    if (!exists) {
      throw new NotFoundException(`Configuración de bases de datos con id ${id} no encontrada`);
    }
    return this.repository.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    const exists = await this.repository.findById(id);
    if (!exists) {
      throw new NotFoundException(`Configuración de bases de datos con id ${id} no encontrada`);
    }
    await this.repository.delete(id);
  }

  async getEnvironments(): Promise<string[]> {
    return this.repository.findDistinctEnvironments();
  }

  async getPortfolioTypes(): Promise<string[]> {
    return this.repository.findDistinctPortfolioTypes();
  }

  async getCampaigns(): Promise<string[]> {
    return this.repository.findDistinctCampaigns();
  }

  async getStateTypes(): Promise<{ value: number; label: string }[]> {
    return this.repository.findDistinctStateTypes();
  }
}
