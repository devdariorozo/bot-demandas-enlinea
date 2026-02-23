import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateConfigDataBasesDto {
  @ApiProperty({ example: 'dev', description: 'Environment: dev, qa, pro' })
  @IsString()
  @MaxLength(20)
  environment!: string;

  @ApiProperty({
    example: 'propias',
    description: 'Portfolio type (e.g. propias, sudameris)',
  })
  @IsString()
  @MaxLength(100)
  portfolio_type!: string;

  @ApiProperty({
    example: 'tuya',
    nullable: true,
    required: false,
    description: 'Campaign identifier',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  campaign?: string | null;

  @ApiProperty({
    type: [String],
    example: ['demandas_propias_dev_tuya_1', 'demandas_propias_dev_tuya_2'],
    description: 'Array of database names to connect',
  })
  @IsArray()
  @IsString({ each: true })
  data_bases!: string[];

  @ApiProperty({
    example: 'Carteras Propias – dev – tuya (3 databases)',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  detail?: string | null;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'State: 0 = inactive, 1 = active',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  state_type?: number;

  @ApiProperty({
    example: 'BOT Demands Online',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  responsible?: string | null;
}

export class UpdateConfigDataBasesDto extends PartialType(
  CreateConfigDataBasesDto,
) {}
