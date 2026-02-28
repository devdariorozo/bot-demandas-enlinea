// Responsabilidad: endpoints HTTP de Nest (controller).

import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { CreateAttentionScheduleDto, AttentionScheduleDto, UpdateAttentionScheduleDto } from '../dto/attentionSchedule.dto';
import { AttentionScheduleService } from '@application/services/attentionSchedule.service';
import { AttentionSchedule } from '@domain/entities/attentionSchedule.entities';
import { CreateAttentionScheduleInput } from '@domain/ports/attentionSchedule.ports';

const createExampleSchema = {
  portfolio_type_id: 1,
  days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
  start_time: '08:00',
  end_time: '17:00',
  detail: 'Horario laboral estándar',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

const updateExampleSchema = {
  portfolio_type_id: 1,
  days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
  start_time: '08:00',
  end_time: '17:00',
  detail: 'Horario laboral estándar',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

@ApiTags('attentionSchedule')
@Controller('attentionSchedule')
export class AttentionScheduleController {
  constructor(private readonly attentionScheduleService: AttentionScheduleService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear horario de atención',
    description:
      'Un solo registro con days como array de días en español (Lunes, Martes, ...).',
  })
  @ApiBody({
    description: 'days: array de días en español. Un único registro con ese array.',
    schema: { allOf: [{ $ref: getSchemaPath(CreateAttentionScheduleDto) }], example: createExampleSchema },
  })
  async create(@Body() dto: CreateAttentionScheduleDto): Promise<AttentionScheduleDto> {
    return this.attentionScheduleService.create(dto as CreateAttentionScheduleInput);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los horarios de atención' })
  async findAll(): Promise<AttentionScheduleDto[]> {
    return this.attentionScheduleService.findAll();
  }

  @Get('byPortfolio')
  @ApiOperation({ summary: 'Obtener horarios por cartera (opcionalmente por día)' })
  @ApiQuery({ name: 'portfolio_type_id', required: true, type: Number })
  @ApiQuery({ name: 'days', required: false, enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] })
  async findByPortfolio(
    @Query('portfolio_type_id') portfolio_type_id: number,
    @Query('days') days?: string,
  ): Promise<AttentionScheduleDto[]> {
    return this.attentionScheduleService.findByPortfolio(Number(portfolio_type_id), days);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un horario por id' })
  async findById(@Param('id') id: number): Promise<AttentionScheduleDto> {
    return this.attentionScheduleService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un horario de atención' })
  @ApiBody({
    schema: { allOf: [{ $ref: getSchemaPath(UpdateAttentionScheduleDto) }], example: updateExampleSchema },
  })
  async update(
    @Param('id') id: number,
    @Body() body: UpdateAttentionScheduleDto,
  ): Promise<AttentionScheduleDto> {
    return this.attentionScheduleService.update({ ...body, id: Number(id) } as AttentionSchedule);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un horario de atención' })
  async delete(@Param('id') id: number): Promise<void> {
    return this.attentionScheduleService.delete(id);
  }
}
