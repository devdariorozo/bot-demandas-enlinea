import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateConfigDataBasesDto {
  @ApiProperty({ example: 'dev', description: 'Ambiente: dev, qa, pro' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  environment: string;

  @ApiProperty({
    example: 'propias',
    description: 'Tipo de cartera (ej. propias, sudameris)',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  portfolio_type: string;

  @ApiPropertyOptional({
    example: 'tuya',
    description: 'Identificador de campaña',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  campaign?: string | null;

  @ApiProperty({
    example: ['db_1', 'db_2'],
    description: 'Nombres de bases de datos a conectar',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  data_bases: string[];

  @ApiPropertyOptional({ description: 'Descripción o detalle' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  detail?: string | null;

  @ApiPropertyOptional({
    example: 1,
    description: 'Estado: 0 = inactivo, 1 = activo',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  state_type?: number;

  @ApiPropertyOptional({ description: 'Responsable o equipo' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  responsible?: string | null;
}
