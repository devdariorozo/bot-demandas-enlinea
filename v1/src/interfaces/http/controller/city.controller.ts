// Responsabilidad: endpoints HTTP de Nest (controller).

import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { CityDto, UpdateCityDto } from '../dto/city.dto';
import { CityService } from '@application/services/city.service';
import { City } from '@domain/entities/city.entities';
import { CreateCityInput } from '@domain/ports/city.ports';

/** Ejemplo JSON que Swagger muestra por defecto en el body (guía visual para quien use la API). */
const createExampleSchema = {
  name: 'ARAUCA',
  departament_id: 1,
  detail: 'Ciudad de Arauca registrada',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

/** Ejemplo JSON para actualizar. El id va solo en la URL (path), no en el body. */
const updateExampleSchema = {
  name: 'ARAUCA',
  departament_id: 1,
  detail: 'Ciudad de Arauca registrada',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

@ApiTags('city')
@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}
  // Crear una nueva ciudad
  @Post()
  @ApiOperation({ summary: 'Crear una nueva ciudad' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: { allOf: [{ $ref: getSchemaPath(CityDto) }], example: createExampleSchema },
  })
  async create(@Body() dto: CityDto): Promise<CityDto> {
    return this.cityService.create(dto as CreateCityInput);
  }
  // Obtener todas las ciudades
  @Get()
  @ApiOperation({ summary: 'Obtener todas las ciudades' })
  async findAll(): Promise<CityDto[]> {
    return this.cityService.findAll();
  }
  // Obtener ciudades por departamento
  @Get('byDepartament/:departament_id')
  @ApiOperation({ summary: 'Obtener ciudades por departamento' })
  async findByDepartament(@Param('departament_id') departament_id: number): Promise<CityDto[]> {
    return this.cityService.findByDepartament(Number(departament_id));
  }
  // Obtener una ciudad por su id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ciudad por su id' })
  async findById(@Param('id') id: number): Promise<CityDto> {
    return this.cityService.findById(id);
  }
  // Actualizar una ciudad
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una ciudad' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: { allOf: [{ $ref: getSchemaPath(UpdateCityDto) }], example: updateExampleSchema },
  })
  async update(@Param('id') id: number, @Body() body: UpdateCityDto): Promise<CityDto> {
    return this.cityService.update({ ...body, id: Number(id) } as City);
  }
  // Eliminar una ciudad
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una ciudad' })
  async delete(@Param('id') id: number): Promise<void> {
    return this.cityService.delete(id);
  }
}

