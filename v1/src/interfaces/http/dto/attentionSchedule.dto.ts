// Responsabilidad: modelos de datos de entrada/salida para HTTP.

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const SHIFT_TYPES = ['continua', 'partida'];
const TIME_24H_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class AttentionScheduleDto {
  @ApiPropertyOptional({ example: 1, description: 'ID (opcional en POST, lo genera la BD)' })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de cartera (portfolio_type)' })
  @IsNumber()
  @IsNotEmpty()
  portfolio_type_id: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de campaña (campaing_type)' })
  @IsNumber()
  @IsNotEmpty()
  campaing_type_id: number;

  @ApiProperty({
    example: 'Lunes',
    description: 'Día de la semana (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo)',
    enum: DAYS_OF_WEEK,
  })
  @IsString()
  @IsIn(DAYS_OF_WEEK)
  day_of_week: string;

  @ApiProperty({
    example: 'continua',
    description: 'Tipo de jornada (continua o partida)',
    enum: SHIFT_TYPES,
  })
  @IsString()
  @IsIn(SHIFT_TYPES)
  shiftType: string;

  @ApiProperty({
    example: '08:00',
    description: 'Hora de inicio en formato 24 horas (HH:mm)',
  })
  @IsString()
  @Matches(TIME_24H_REGEX, { message: 'start_time must be in HH:mm 24h format' })
  start_time: string;

  @ApiProperty({
    example: '17:00',
    description: 'Hora de fin en formato 24 horas (HH:mm)',
  })
  @IsString()
  @Matches(TIME_24H_REGEX, { message: 'end_time must be in HH:mm 24h format' })
  end_time: string;

  @ApiProperty({
    example: 'Horario continuo de 8 a 17 para Propias / Claro',
    description: 'Descripción del horario',
  })
  @IsString()
  @IsNotEmpty()
  detail: string;

  @ApiProperty({ example: 1, description: 'ID del tipo de estado (state_type)' })
  @IsNumber()
  @IsNotEmpty()
  state_type_id: number;

  @ApiPropertyOptional({ example: '2026-02-25T12:00:00.000Z', description: 'Fecha de creación (opcional en POST)' })
  @IsDate()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({ example: '2026-02-25T12:00:00.000Z', description: 'Fecha de actualización (opcional en POST)' })
  @IsDate()
  @IsOptional()
  updated_at?: Date;

  @ApiProperty({ example: 'BOT demands online', description: 'Responsable del registro' })
  @IsString()
  @IsNotEmpty()
  responsible: string;
}

/** Body para PUT: solo los campos a actualizar. El id va en la URL, no en el body. */
export class UpdateAttentionScheduleDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de cartera (portfolio_type)' })
  @IsNumber()
  @IsNotEmpty()
  portfolio_type_id: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de campaña (campaing_type)' })
  @IsNumber()
  @IsNotEmpty()
  campaing_type_id: number;

  @ApiProperty({
    example: 'Lunes',
    description: 'Día de la semana (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo)',
    enum: DAYS_OF_WEEK,
  })
  @IsString()
  @IsIn(DAYS_OF_WEEK)
  day_of_week: string;

  @ApiProperty({
    example: 'continua',
    description: 'Tipo de jornada (continua o partida)',
    enum: SHIFT_TYPES,
  })
  @IsString()
  @IsIn(SHIFT_TYPES)
  shiftType: string;

  @ApiProperty({
    example: '08:00',
    description: 'Hora de inicio en formato 24 horas (HH:mm)',
  })
  @IsString()
  @Matches(TIME_24H_REGEX, { message: 'start_time must be in HH:mm 24h format' })
  start_time: string;

  @ApiProperty({
    example: '17:00',
    description: 'Hora de fin en formato 24 horas (HH:mm)',
  })
  @IsString()
  @Matches(TIME_24H_REGEX, { message: 'end_time must be in HH:mm 24h format' })
  end_time: string;

  @ApiProperty({
    example: 'Horario continuo de 8 a 17 para Propias / Claro',
    description: 'Descripción del horario',
  })
  @IsString()
  @IsNotEmpty()
  detail: string;

  @ApiProperty({ example: 1, description: 'ID del tipo de estado (state_type)' })
  @IsNumber()
  @IsNotEmpty()
  state_type_id: number;

  @ApiPropertyOptional({ example: '2026-02-25T12:00:00.000Z', description: 'Fecha de creación' })
  @IsDate()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({ example: '2026-02-25T12:00:00.000Z', description: 'Fecha de actualización' })
  @IsDate()
  @IsOptional()
  updated_at?: Date;

  @ApiProperty({ example: 'BOT demands online', description: 'Responsable del registro' })
  @IsString()
  @IsNotEmpty()
  responsible: string;
}

