// Responsabilidad: modelos de datos de entrada/salida para HTTP (amount_type).

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDate } from 'class-validator';

export class AmountTypeDto {
  @ApiPropertyOptional({ example: 1, description: 'ID (opcional en POST, lo genera la BD)' })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ example: 'Mayor Cuantía', description: 'Tipo de cuantía' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: 'CIVIL CIRCUITO - MAYOR CUANTÍA',
    description: 'Especialidad del proceso',
  })
  @IsString()
  @IsNotEmpty()
  specialty_process: string;

  @ApiProperty({
    example: '31-03-07 PROCESOS EJECUTIVOS',
    description: 'Clase de proceso',
  })
  @IsString()
  @IsNotEmpty()
  class_process: string;

  @ApiProperty({
    example: 'Demanda con mayor cuantia',
    description: 'Detalle descriptivo',
  })
  @IsString()
  @IsNotEmpty()
  detail: string;

  @ApiProperty({ example: 1, description: 'ID del tipo de estado' })
  @IsNumber()
  @IsNotEmpty()
  state_type_id: number;

  @ApiPropertyOptional({
    example: '2026-02-25T12:00:00.000Z',
    description: 'Fecha de creación (opcional en POST)',
  })
  @IsDate()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    example: '2026-02-25T12:00:00.000Z',
    description: 'Fecha de actualización (opcional en POST)',
  })
  @IsDate()
  @IsOptional()
  updated_at?: Date;

  @ApiProperty({
    example: 'BOT demands online',
    description: 'Responsable del registro',
  })
  @IsString()
  @IsNotEmpty()
  responsible: string;
}

/** Body para PUT: solo los campos a actualizar. El id va en la URL, no en el body. */
export class UpdateAmountTypeDto {
  @ApiProperty({ example: 'Mayor Cuantía', description: 'Tipo de cuantía' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: 'CIVIL CIRCUITO - MAYOR CUANTÍA',
    description: 'Especialidad del proceso',
  })
  @IsString()
  @IsNotEmpty()
  specialty_process: string;

  @ApiProperty({
    example: '31-03-07 PROCESOS EJECUTIVOS',
    description: 'Clase de proceso',
  })
  @IsString()
  @IsNotEmpty()
  class_process: string;

  @ApiProperty({
    example: 'Demanda con mayor cuantia',
    description: 'Detalle descriptivo',
  })
  @IsString()
  @IsNotEmpty()
  detail: string;

  @ApiProperty({ example: 1, description: 'ID del tipo de estado' })
  @IsNumber()
  @IsNotEmpty()
  state_type_id: number;

  @ApiPropertyOptional({ example: '2026-02-25T12:00:00.000Z', description: 'Fecha de creación' })
  @IsDate()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    example: '2026-02-25T12:00:00.000Z',
    description: 'Fecha de actualización',
  })
  @IsDate()
  @IsOptional()
  updated_at?: Date;

  @ApiProperty({
    example: 'BOT demands online',
    description: 'Responsable del registro',
  })
  @IsString()
  @IsNotEmpty()
  responsible: string;
}

