// Responsabilidad: endpoints HTTP de Nest (controller).

import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { DataBasesDto, UpdateDataBasesDto } from '../dto/dataBases.dto';
import { DataBasesService } from '@application/services/dataBases.service';
import { DataBases } from '@domain/entities/dataBases.entities';
import { CreateDataBasesInput } from '@domain/ports/dataBases.ports';

/** Ejemplo JSON que Swagger muestra por defecto en el body (guía visual para quien use la API). */
const createExampleSchema = {
  environment_type_id: 1,
  portfolio_type_id: 1,
  bases: ['dev_db_1', 'dev_db_2', 'dev_db_3'],
  detail: 'Bases de datos para entorno dev, cartera Propias',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

/** Ejemplo JSON para actualizar. El id va solo en la URL (path), no en el body. */
const updateExampleSchema = {
  environment_type_id: 1,
  portfolio_type_id: 1,
  bases: ['dev_db_1', 'dev_db_2'],
  detail: 'Bases de datos para entorno dev, cartera Propias',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

@ApiTags('dataBases')
@Controller('dataBases')
export class DataBasesController {
  constructor(private readonly dataBasesService: DataBasesService) {}

  // Crear un nuevo registro de bases
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo registro de bases' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: { allOf: [{ $ref: getSchemaPath(DataBasesDto) }], example: createExampleSchema },
  })
  async create(@Body() dto: DataBasesDto): Promise<DataBasesDto> {
    return this.dataBasesService.create(dto as CreateDataBasesInput);
  }

  // Obtener todos los registros de bases
  @Get()
  @ApiOperation({ summary: 'Obtener todos los registros de bases' })
  async findAll(): Promise<DataBasesDto[]> {
    return this.dataBasesService.findAll();
  }

  // Obtener registros por combinación entorno/cartera (ruta fija antes de :id)
  @Get('byEnvAndPortf')
  @ApiOperation({ summary: 'Obtener registros de bases por combinación entorno/cartera' })
  async findByEnvAndPortf(
    @Query('environment_type_id') environment_type_id: number,
    @Query('portfolio_type_id') portfolio_type_id: number,
  ): Promise<DataBasesDto[]> {
    return this.dataBasesService.findByEnvAndPortf(
      Number(environment_type_id),
      Number(portfolio_type_id),
    );
  }

  // Obtener un registro de bases por su id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de bases por su id' })
  async findById(@Param('id') id: number): Promise<DataBasesDto> {
    return this.dataBasesService.findById(id);
  }

  // Actualizar un registro de bases
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un registro de bases' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: { allOf: [{ $ref: getSchemaPath(UpdateDataBasesDto) }], example: updateExampleSchema },
  })
  async update(@Param('id') id: number, @Body() body: UpdateDataBasesDto): Promise<DataBasesDto> {
    return this.dataBasesService.update({ ...body, id: Number(id) } as DataBases);
  }

  // Eliminar un registro de bases
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro de bases' })
  async delete(@Param('id') id: number): Promise<void> {
    return this.dataBasesService.delete(id);
  }
}

