// Responsabilidad: endpoints HTTP de Nest (controller).

import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { AttentionScheduleDto, UpdateAttentionScheduleDto } from '../dto/attentionSchedule.dto';
import { AttentionScheduleService } from '@application/services/attentionSchedule.service';
import { AttentionSchedule } from '@domain/entities/attentionSchedule.entities';
import { CreateAttentionScheduleInput } from '@domain/ports/attentionSchedule.ports';

/** Ejemplo JSON que Swagger muestra por defecto en el body (guía visual para quien use la API). */
const createExampleSchema = {
  portfolio_type_id: 1,
  campaing_type_id: 1,
  day_of_week: 'Lunes',
  shiftType: 'continua',
  start_time: '08:00',
  end_time: '17:00',
  detail: 'Horario continuo de 8 a 17 para Propias / Claro',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

/** Ejemplo JSON para actualizar. El id va solo en la URL (path), no en el body. */
const updateExampleSchema = {
  portfolio_type_id: 1,
  campaing_type_id: 1,
  day_of_week: 'Lunes',
  shiftType: 'continua',
  start_time: '08:00',
  end_time: '17:00',
  detail: 'Horario continuo de 8 a 17 para Propias / Claro',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

@ApiTags('attentionSchedule')
@Controller('attentionSchedule')
export class AttentionScheduleController {
  constructor(private readonly attentionScheduleService: AttentionScheduleService) {}

  // Crear un nuevo horario de atención
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo horario de atención' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: { allOf: [{ $ref: getSchemaPath(AttentionScheduleDto) }], example: createExampleSchema },
  })
  async create(@Body() dto: AttentionScheduleDto): Promise<AttentionScheduleDto> {
    return this.attentionScheduleService.create(dto as CreateAttentionScheduleInput);
  }

  // Obtener todos los horarios de atención
  @Get()
  @ApiOperation({ summary: 'Obtener todos los horarios de atención' })
  async findAll(): Promise<AttentionScheduleDto[]> {
    return this.attentionScheduleService.findAll();
  }

  // Obtener horarios por combinación cartera/campaña (ruta fija antes de :id)
  @Get('byPortfolioAndCampaing')
  @ApiOperation({ summary: 'Obtener horarios por combinación cartera/campaña' })
  async findByPortfolioAndCampaing(
    @Query('portfolio_type_id') portfolio_type_id: number,
    @Query('campaing_type_id') campaing_type_id: number,
  ): Promise<AttentionScheduleDto[]> {
    return this.attentionScheduleService.findByPortfolioAndCampaing(
      Number(portfolio_type_id),
      Number(campaing_type_id),
    );
  }

  // Obtener un horario de atención por su id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un horario de atención por su id' })
  async findById(@Param('id') id: number): Promise<AttentionScheduleDto> {
    return this.attentionScheduleService.findById(id);
  }

  // Actualizar un horario de atención
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un horario de atención' })
  @ApiBody({
    description: 'El JSON de abajo sirve de guía.',
    schema: { allOf: [{ $ref: getSchemaPath(UpdateAttentionScheduleDto) }], example: updateExampleSchema },
  })
  async update(@Param('id') id: number, @Body() body: UpdateAttentionScheduleDto): Promise<AttentionScheduleDto> {
    return this.attentionScheduleService.update({ ...body, id: Number(id) } as AttentionSchedule);
  }

  // Eliminar un horario de atención
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un horario de atención' })
  async delete(@Param('id') id: number): Promise<void> {
    return this.attentionScheduleService.delete(id);
  }
}

