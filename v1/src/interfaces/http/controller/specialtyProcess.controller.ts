// Responsabilidad: endpoints HTTP de Nest (controller).

import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { SpecialtyProcessDto, UpdateSpecialtyProcessDto } from '@interfaces/http/dto/specialtyProcess.dto';
import { SpecialtyProcessService } from '@application/services/specialtyProcess.service';
import { SpecialtyProcess } from '@domain/entities/specialtyProcess.entities';
import { CreateSpecialtyProcessInput } from '@domain/ports/specialtyProcess.ports';

/** Ejemplo JSON que Swagger muestra por defecto en el body (guía visual para quien use la API). */
const createExampleSchema = {
  type: 'CIVIL CIRCUITO - MAYOR CUANTÍA',
  detail: 'Especialidad civil circuito mayor cuantía registrada',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

/** Ejemplo JSON para actualizar. El id va solo en la URL (path), no en el body. */
const updateExampleSchema = {
  type: 'CIVIL CIRCUITO - MAYOR CUANTÍA',
  detail: 'Especialidad civil circuito mayor cuantía registrada',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

@ApiTags('specialtyProcess')
@Controller('specialtyProcess')
export class SpecialtyProcessController {
  constructor(private readonly specialtyProcessService: SpecialtyProcessService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva especialidad de proceso' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: { allOf: [{ $ref: getSchemaPath(SpecialtyProcessDto) }], example: createExampleSchema },
  })
  async create(@Body() dto: SpecialtyProcessDto): Promise<SpecialtyProcessDto> {
    return this.specialtyProcessService.create(dto as CreateSpecialtyProcessInput);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las especialidades de proceso' })
  async findAll(): Promise<SpecialtyProcessDto[]> {
    return this.specialtyProcessService.findAll();
  }

  @Get('byType/:type')
  @ApiOperation({ summary: 'Obtener una especialidad de proceso por su type' })
  async findByType(@Param('type') type: string): Promise<SpecialtyProcessDto> {
    return this.specialtyProcessService.findByType(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una especialidad de proceso por su id' })
  async findById(@Param('id') id: number): Promise<SpecialtyProcessDto> {
    return this.specialtyProcessService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una especialidad de proceso' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: { allOf: [{ $ref: getSchemaPath(UpdateSpecialtyProcessDto) }], example: updateExampleSchema },
  })
  async update(
    @Param('id') id: number,
    @Body() body: UpdateSpecialtyProcessDto,
  ): Promise<SpecialtyProcessDto> {
    return this.specialtyProcessService.update({ ...body, id: Number(id) } as SpecialtyProcess);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una especialidad de proceso' })
  async delete(@Param('id') id: number): Promise<void> {
    return this.specialtyProcessService.delete(id);
  }
}
