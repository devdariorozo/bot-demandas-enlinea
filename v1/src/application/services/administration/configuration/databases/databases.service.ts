//===============================================================
// Servicio de configuración de bases de datos
//===============================================================


import {
  ConflictException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import {
  ConfigDataBasesRepositoryPort,
  CONFIG_DATA_BASES_REPOSITORY,
} from '@domain/ports/administration/configuration/databases/databases.port';
import { ConfigDataBases } from '@domain/entities/administration/configuration/databases/databases.interface';
import {
  CreateConfigDataBasesDto,
  UpdateConfigDataBasesDto,
} from '@interfaces/http/dto/administration/configuration/databases/databases.dto';

@Injectable()
export class ConfigDataBasesService {
  constructor(
    @Inject(CONFIG_DATA_BASES_REPOSITORY)
    private readonly repository: ConfigDataBasesRepositoryPort,
  ) {}

  async create(dto: CreateConfigDataBasesDto): Promise<ConfigDataBases> {
    const existing = await this.repository.findByNaturalKey(
      dto.environment,
      dto.portfolio_type,
      dto.campaign ?? null,
    );
    if (existing) {
      throw new ConflictException(
        'Ya existe una configuración de bases de datos con el mismo ambiente, tipo de cartera y campaña.',
      );
    }
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
    const environment = dto.environment ?? exists.environment;
    const portfolio_type = dto.portfolio_type ?? exists.portfolio_type;
    const campaign = dto.campaign !== undefined ? dto.campaign : exists.campaign;
    const duplicate = await this.repository.findByNaturalKey(
      environment,
      portfolio_type,
      campaign ?? null,
    );
    if (duplicate && duplicate.id !== id) {
      throw new ConflictException(
        'Ya existe otra configuración con el mismo ambiente, tipo de cartera y campaña.',
      );
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
