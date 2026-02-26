// Responsabilidad: modelos de datos de entrada/salida para HTTP.

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ClassProcessDto {
  @ApiPropertyOptional({ example: 1, description: 'ID (opcional en POST, lo genera la BD)' })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ example: 3, description: 'ID de la especialidad de proceso (specialty_process)' })
  @IsNumber()
  @IsNotEmpty()
  specialty_process_id: number;

  @ApiProperty({
    example: '41-03-08 EJECUTIVO DE MÍNIMA CUANTÍA',
    description: 'Código y tipo de la clase de proceso (ej. para especialidad id 3)',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: 'Ejecutivo de mínima cuantía registrado',
    description: 'Descripción o detalle de la clase de proceso',
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

  @ApiProperty({ example: 'BOT demands online', description: 'Responsable del registro' })
  @IsString()
  @IsNotEmpty()
  responsible: string;
}

/** Body para PUT: solo los campos a actualizar. El id va en la URL. */
export class UpdateClassProcessDto {
  @ApiProperty({ example: 3, description: 'ID de la especialidad de proceso' })
  @IsNumber()
  @IsNotEmpty()
  specialty_process_id: number;

  @ApiProperty({
    example: '41-03-08 EJECUTIVO DE MÍNIMA CUANTÍA',
    description: 'Código y tipo de la clase de proceso',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: 'Ejecutivo de mínima cuantía registrado',
    description: 'Descripción de la clase de proceso',
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

  @ApiProperty({ example: 'BOT demands online', description: 'Responsable' })
  @IsString()
  @IsNotEmpty()
  responsible: string;
}
