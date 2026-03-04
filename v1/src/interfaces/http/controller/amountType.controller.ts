// Responsabilidad: endpoints HTTP de Nest para amount_type.

import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';

import { AmountTypeService } from '@application/services/amountType.service';
import { AmountType } from '@domain/entities/amountType.entities';
import { CreateAmountTypeInput } from '@domain/ports/amountType.ports';
import { AmountTypeDto, UpdateAmountTypeDto } from '../dto/amountType.dto';
import { PaginatedResult, paginateArray } from '@application/utils/pagination.utils';
import { dataEmpty, dataOne } from '@application/utils/response.utils';

/** Ejemplo JSON que Swagger muestra por defecto en el body (guía visual para quien use la API). */
const createExampleSchema = {
  type: 'Mayor Cuantía',
  specialty_process: 'CIVIL CIRCUITO - MAYOR CUANTÍA',
  class_process: '31-03-07 PROCESOS EJECUTIVOS',
  detail: 'Demanda con mayor cuantia',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

/** Ejemplo JSON para actualizar. El id va solo en la URL (path), no en el body. */
const updateExampleSchema = {
  type: 'Mayor Cuantía',
  specialty_process: 'CIVIL CIRCUITO - MAYOR CUANTÍA',
  class_process: '31-03-07 PROCESOS EJECUTIVOS',
  detail: 'Demanda con mayor cuantia',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

@ApiTags('amountType')
@Controller('amount_type')
export class AmountTypeController {
  constructor(private readonly amountTypeService: AmountTypeService) {}

  // Crear un nuevo tipo de cuantía
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de cuantía' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: { allOf: [{ $ref: getSchemaPath(AmountTypeDto) }], example: createExampleSchema },
  })
  async create(@Body() dto: AmountTypeDto) {
    const created = await this.amountTypeService.create(dto as CreateAmountTypeInput);
    return dataOne(created);
  }

  // Obtener todos los tipos de cuantía (con paginación y filtros)
  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de cuantía' })
  @ApiQuery({
    name: 'start_date',
    required: false,
    type: String,
    description: 'Fecha inicial de creación (YYYY-MM-DD).',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    type: String,
    description: 'Fecha final de creación (YYYY-MM-DD).',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Filtrar por type (búsqueda parcial, opcional).',
  })
  @ApiQuery({
    name: 'specialty_process',
    required: false,
    type: String,
    description: 'Filtrar por specialty_process (búsqueda parcial, opcional).',
  })
  @ApiQuery({
    name: 'class_process',
    required: false,
    type: String,
    description: 'Filtrar por class_process (búsqueda parcial, opcional).',
  })
  @ApiQuery({
    name: 'state_type_id',
    required: false,
    type: Number,
    description: 'Filtrar por state_type_id (opcional).',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (>=1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Registros por página (>=1)',
  })
  async findAll(
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('type') type?: string,
    @Query('specialty_process') specialty_process?: string,
    @Query('class_process') class_process?: string,
    @Query('state_type_id') state_type_id?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedResult<AmountTypeDto>> {
    const all = await this.amountTypeService.findAll();

    const parseDate = (value?: string): Date | undefined => {
      if (!value) return undefined;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? undefined : d;
    };

    const start = parseDate(start_date);
    const end = parseDate(end_date);

    const normalizedStateId =
      state_type_id === undefined || state_type_id === null
        ? undefined
        : (() => {
            const n = typeof state_type_id === 'number' ? state_type_id : Number(state_type_id as any);
            if (!Number.isFinite(n) || n <= 0) return undefined;
            return Math.floor(n);
          })();

    const normalizedType = (type ?? '').trim().toLowerCase();
    const normalizedSpecialty = (specialty_process ?? '').trim().toLowerCase();
    const normalizedClass = (class_process ?? '').trim().toLowerCase();

    const byDate = all.filter((item) => {
      const created = (item as any).created_at ? new Date((item as any).created_at) : undefined;
      if (!created || Number.isNaN(created.getTime())) return true;
      if (start && created < start) return false;
      if (end && created > end) return false;
      return true;
    });

    const filtered = byDate.filter((item) => {
      if (normalizedType && !(item.type ?? '').toLowerCase().includes(normalizedType)) return false;
      if (normalizedSpecialty && !(item.specialty_process ?? '').toLowerCase().includes(normalizedSpecialty)) return false;
      if (normalizedClass && !(item.class_process ?? '').toLowerCase().includes(normalizedClass)) return false;
      if (normalizedStateId !== undefined && Number(item.state_type_id) !== normalizedStateId) return false;
      return true;
    });

    return paginateArray(filtered, page, limit);
  }

  // Obtener un tipo de cuantía por su id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de cuantía por su id' })
  async findById(@Param('id') id: number) {
    const item = await this.amountTypeService.findById(id);
    return dataOne(item);
  }

  // Actualizar un tipo de cuantía
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de cuantía' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: { allOf: [{ $ref: getSchemaPath(UpdateAmountTypeDto) }], example: updateExampleSchema },
  })
  async update(@Param('id') id: number, @Body() body: UpdateAmountTypeDto) {
    const updated = await this.amountTypeService.update({ ...body, id: Number(id) } as AmountType);
    return dataOne(updated);
  }

  // Eliminar un tipo de cuantía
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tipo de cuantía' })
  async delete(@Param('id') id: number) {
    await this.amountTypeService.delete(id);
    return dataEmpty();
  }
}

