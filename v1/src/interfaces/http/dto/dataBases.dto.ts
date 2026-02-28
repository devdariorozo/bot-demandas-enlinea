// Responsabilidad: modelos de datos de entrada/salida para HTTP.

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class DataBasesDto {
  @ApiPropertyOptional({ example: 1, description: 'ID (opcional en POST, lo genera la BD)' })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de entorno (environment_type)' })
  @IsNumber()
  @IsNotEmpty()
  environment_type_id: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de cartera (portfolio_type)' })
  @IsNumber()
  @IsNotEmpty()
  portfolio_type_id: number;

  @ApiPropertyOptional({
    example: 'Sudameris docker',
    description:
      'Solo en respuestas de listado: "portfolio_type_name environment_type_name". Si environment es "pro", solo portfolio_type_name.',
  })
  @IsString()
  @IsOptional()
  label_data_base?: string;

  @ApiProperty({
    example: ['dev_db_1', 'dev_db_2'],
    description: 'Listado de bases de datos asociadas (puede ser 1 o muchas)',
    isArray: true,
    type: String,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  bases: string[];

  @ApiProperty({
    example: 'Bases de datos para entorno dev, cartera Propias',
    description: 'Descripción del grupo de bases',
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
export class UpdateDataBasesDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de entorno (environment_type)' })
  @IsNumber()
  @IsNotEmpty()
  environment_type_id: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de cartera (portfolio_type)' })
  @IsNumber()
  @IsNotEmpty()
  portfolio_type_id: number;

  @ApiProperty({
    example: ['dev_db_1', 'dev_db_2'],
    description: 'Listado de bases de datos asociadas (puede ser 1 o muchas)',
    isArray: true,
    type: String,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  bases: string[];

  @ApiProperty({
    example: 'Bases de datos para entorno dev, cartera Propias',
    description: 'Descripción del grupo de bases',
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


