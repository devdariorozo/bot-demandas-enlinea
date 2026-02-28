// Responsabilidad: endpoints HTTP de Nest (controller).

import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { PortfolioCityConfigDto, UpdatePortfolioCityConfigDto } from '../dto/portfolioCityConfig.dto';
import { PortfolioCityConfigService } from '@application/services/portfolioCityConfig.service';
import { PortfolioCityConfig } from '@domain/entities/portfolioCityConfig.entities';
import { CreatePortfolioCityConfigInput } from '@domain/ports/portfolioCityConfig.ports';

const createExampleSchema = {
  id_data_bases: 1,
  id_city_views: 149,
  name_departament: 'BOGOTÁ',
  name_city: 'BOGOTÁ',
  city: 'BOGOTÁ - BOGOTÁ',
  detail: 'Configuración cartera propia Bogotá',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

const updateExampleSchema = {
  id_data_bases: 1,
  id_city_views: 149,
  name_departament: 'BOGOTÁ',
  name_city: 'BOGOTÁ',
  city: 'BOGOTÁ - BOGOTÁ',
  detail: 'Configuración cartera propia Bogotá',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

@ApiTags('portfolioCityConfig')
@Controller('portfolioCityConfig')
export class PortfolioCityConfigController {
  constructor(private readonly portfolioCityConfigService: PortfolioCityConfigService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva configuración cartera-ciudad' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: {
      allOf: [{ $ref: getSchemaPath(PortfolioCityConfigDto) }],
      example: createExampleSchema,
    },
  })
  async create(@Body() dto: PortfolioCityConfigDto): Promise<PortfolioCityConfigDto> {
    return this.portfolioCityConfigService.create(dto as CreatePortfolioCityConfigInput);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las configuraciones' })
  async findAll(): Promise<PortfolioCityConfigDto[]> {
    return this.portfolioCityConfigService.findAll();
  }

  @Get('byDataBasesAndCityViews')
  @ApiOperation({ summary: 'Obtener una configuración por id_data_bases e id_city_views' })
  @ApiResponse({ status: 404, description: 'No se encontró configuración para los ids indicados' })
  async findByDataBasesAndCityViews(
    @Query('id_data_bases') id_data_bases: number,
    @Query('id_city_views') id_city_views: number,
  ): Promise<PortfolioCityConfigDto> {
    return this.portfolioCityConfigService.findByDataBasesAndCityViews(
      Number(id_data_bases),
      Number(id_city_views),
    );
  }

  @Get('vCitiesFetch')
  @ApiOperation({
    summary: 'vCitiesFetch - Consultar vista v_cities',
    description:
      'Ejecuta una consulta sobre la primera base de datos del registro data_bases indicado, contra la vista v_cities. Retorna id, city_name, department, city.',
  })
  @ApiQuery({
    name: 'id_data_bases',
    required: true,
    type: Number,
    description: 'ID del registro en data_bases; se usa la primera base del array (posición 0) para consultar v_cities.',
  })
  async vCitiesFetch(
    @Query('id_data_bases') id_data_bases: number,
  ): Promise<{ id: number; city_name: string; department: string; city: string }[]> {
    return this.portfolioCityConfigService.vCitiesFetch(Number(id_data_bases));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una configuración por id' })
  async findById(@Param('id') id: number): Promise<PortfolioCityConfigDto> {
    return this.portfolioCityConfigService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una configuración' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: {
      allOf: [{ $ref: getSchemaPath(UpdatePortfolioCityConfigDto) }],
      example: updateExampleSchema,
    },
  })
  async update(
    @Param('id') id: number,
    @Body() body: UpdatePortfolioCityConfigDto,
  ): Promise<PortfolioCityConfigDto> {
    return this.portfolioCityConfigService.update({ ...body, id: Number(id) } as PortfolioCityConfig);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una configuración' })
  async delete(@Param('id') id: number): Promise<void> {
    return this.portfolioCityConfigService.delete(id);
  }
}
