// Responsabilidad: endpoints HTTP de Nest (controller).

import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ClassProcessConfigDto, UpdateClassProcessConfigDto } from '../dto/classProcessConfig.dto';
import { ClassProcessConfigService } from '@application/services/classProcessConfig.service';
import { ClassProcessConfig } from '@domain/entities/classProcessConfig.entities';
import { CreateClassProcessConfigInput } from '@domain/ports/classProcessConfig.ports';

/** POST: solo IDs y campos editables; los *_name los devuelve el backend en la respuesta. */
const createExampleSchema = {
  portfolio_type_id: 1,
  campaing_type_id: 1,
  class_process_ids: [4, 3],
  detail: 'Config Propias + Claro: clase de proceso 4',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

/** PUT: solo IDs y campos editables; los *_name los devuelve el backend en la respuesta. */
const updateExampleSchema = {
  portfolio_type_id: 1,
  campaing_type_id: 1,
  class_process_ids: [4, 3],
  detail: 'Config Propias + Claro: clase de proceso 4',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

@ApiTags('classProcessConfig')
@Controller('classProcessConfig')
export class ClassProcessConfigController {
  constructor(private readonly classProcessConfigService: ClassProcessConfigService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una configuración cartera+campaña+clases de proceso' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: { allOf: [{ $ref: getSchemaPath(ClassProcessConfigDto) }], example: createExampleSchema },
  })
  async create(@Body() dto: ClassProcessConfigDto): Promise<ClassProcessConfigDto> {
    return this.classProcessConfigService.create(dto as CreateClassProcessConfigInput);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las configuraciones' })
  async findAll(): Promise<ClassProcessConfigDto[]> {
    return this.classProcessConfigService.findAll();
  }

  @Get('byPortfolioAndCampaing')
  @ApiOperation({ summary: 'Obtener configuraciones por combinación cartera+campaña' })
  async findByPortfolioAndCampaing(
    @Query('portfolio_type_id') portfolio_type_id: number,
    @Query('campaing_type_id') campaing_type_id: number,
  ): Promise<ClassProcessConfigDto[]> {
    return this.classProcessConfigService.findByPortfolioAndCampaing(
      Number(portfolio_type_id),
      Number(campaing_type_id),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una configuración por su id' })
  async findById(@Param('id') id: number): Promise<ClassProcessConfigDto> {
    return this.classProcessConfigService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una configuración' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: { allOf: [{ $ref: getSchemaPath(UpdateClassProcessConfigDto) }], example: updateExampleSchema },
  })
  async update(
    @Param('id') id: number,
    @Body() body: UpdateClassProcessConfigDto,
  ): Promise<ClassProcessConfigDto> {
    return this.classProcessConfigService.update({ ...body, id: Number(id) } as ClassProcessConfig);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una configuración' })
  async delete(@Param('id') id: number): Promise<void> {
    return this.classProcessConfigService.delete(id);
  }
}
