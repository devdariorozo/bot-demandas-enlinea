// Responsabilidad: modelos de datos de entrada/salida para HTTP.

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ClassProcessConfigDto {
  @ApiPropertyOptional({ example: 1, description: 'ID (opcional en POST, lo genera la BD)' })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de cartera (portfolio_type)' })
  @IsNumber()
  @IsNotEmpty()
  portfolio_type_id: number;

  @ApiPropertyOptional({ example: 'Propias', description: 'Nombre del tipo de cartera (solo lectura)' })
  @IsString()
  @IsOptional()
  portfolio_type_name?: string;

  @ApiProperty({ example: 1, description: 'ID del tipo de campaña (campaing_type)' })
  @IsNumber()
  @IsNotEmpty()
  campaing_type_id: number;

  @ApiPropertyOptional({ example: 'Claro', description: 'Nombre del tipo de campaña (solo lectura)' })
  @IsString()
  @IsOptional()
  campaing_type_name?: string;

  @ApiProperty({
    example: [4, 3],
    description: 'IDs de clases de proceso (class_process) asociadas a esta cartera+campaña',
    isArray: true,
    type: Number,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  class_process_ids: number[];

  @ApiPropertyOptional({
    example: ['41-03-08 EJECUTIVO DE MÍNIMA CUANTÍA', '41-03-02 MONITORIO'],
    description: 'Nombres de las clases de proceso (solo lectura; el backend los calcula a partir de class_process_ids)',
    isArray: true,
    type: String,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  class_process_names?: string[];

  @ApiProperty({
    example: 'Config Propias + Claro: clase de proceso 4',
    description: 'Descripción de la configuración',
  })
  @IsString()
  @IsNotEmpty()
  detail: string;

  @ApiProperty({ example: 1, description: 'ID del tipo de estado (state_type)' })
  @IsNumber()
  @IsNotEmpty()
  state_type_id: number;

  @ApiPropertyOptional({ example: 'Active', description: 'Nombre del tipo de estado (solo lectura)' })
  @IsString()
  @IsOptional()
  state_type_name?: string;

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

/** Body para PUT: solo IDs y campos editables. Los *_name los devuelve el backend en la respuesta (solo lectura). */
export class UpdateClassProcessConfigDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de cartera (portfolio_type)' })
  @IsNumber()
  @IsNotEmpty()
  portfolio_type_id: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de campaña (campaing_type)' })
  @IsNumber()
  @IsNotEmpty()
  campaing_type_id: number;

  @ApiProperty({
    example: [4, 3],
    description: 'IDs de clases de proceso (class_process) asociadas',
    isArray: true,
    type: Number,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  class_process_ids: number[];

  @ApiProperty({
    example: 'Config Propias + Claro: clase de proceso 4',
    description: 'Descripción de la configuración',
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
