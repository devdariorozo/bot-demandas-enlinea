// Responsabilidad: endpoints HTTP de Nest (controller).

import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { DepartamentDto, UpdateDepartamentDto } from '../dto/departament.dto';
import { DepartamentService } from '@application/services/departament.service';
import { Departament } from '@domain/entities/departament.entities';
import { CreateDepartamentInput } from '@domain/ports/departament.ports';

/** Ejemplo JSON que Swagger muestra por defecto en el body (guía visual para quien use la API). */
const createExampleSchema = {
  name: 'ARAUCA',
  detail: 'Departamento de Arauca registrado',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

/** Ejemplo JSON para actualizar. El id va solo en la URL (path), no en el body. */
const updateExampleSchema = {
  name: 'ARAUCA',
  detail: 'Departamento de Arauca registrado',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

@ApiTags('departament')
@Controller('departament')
export class DepartamentController {
  constructor(private readonly departamentService: DepartamentService) {}
  // Crear un nuevo departamento
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo departamento' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: { allOf: [{ $ref: getSchemaPath(DepartamentDto) }], example: createExampleSchema },
  })
  async create(@Body() dto: DepartamentDto): Promise<DepartamentDto> {
    return this.departamentService.create(dto as CreateDepartamentInput);
  }
  // Obtener todos los departamentos
  @Get()
  @ApiOperation({ summary: 'Obtener todos los departamentos' })
  async findAll(): Promise<DepartamentDto[]> {
    return this.departamentService.findAll();
  }
  // Obtener un departamento por su nombre (ruta fija antes de :id)
  @Get('byName/:name')
  @ApiOperation({ summary: 'Obtener un departamento por su nombre' })
  async findByName(@Param('name') name: string): Promise<DepartamentDto> {
    return this.departamentService.findByName(name);
  }
  // Obtener un departamento por su id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un departamento por su id' })
  async findById(@Param('id') id: number): Promise<DepartamentDto> {
    return this.departamentService.findById(id);
  }
  // Actualizar un departamento
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un departamento' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: { allOf: [{ $ref: getSchemaPath(UpdateDepartamentDto) }], example: updateExampleSchema },
  })
  async update(@Param('id') id: number, @Body() body: UpdateDepartamentDto): Promise<DepartamentDto> {
    return this.departamentService.update({ ...body, id: Number(id) } as Departament);
  }
  // Eliminar un departamento
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un departamento' })
  async delete(@Param('id') id: number): Promise<void> {
    return this.departamentService.delete(id);
  }
}

