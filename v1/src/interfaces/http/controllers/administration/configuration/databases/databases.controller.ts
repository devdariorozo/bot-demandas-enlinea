import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigDataBasesService } from '@application/services/administration/configuration/databases/databases.service';
import {
  CreateConfigDataBasesDto,
  UpdateConfigDataBasesDto,
} from '../../../../dto/administration/configuration/databases/databases.dto';

@ApiTags('databases')
@Controller('administration/configuration/databases')
export class ConfigDataBasesController {
  constructor(private readonly service: ConfigDataBasesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear configuración de bases de datos' })
  create(@Body() dto: CreateConfigDataBasesDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar configuraciones (con filtros opcionales)',
  })
  findAll(
    @Query('environment') environment?: string,
    @Query('portfolio_type') portfolio_type?: string,
    @Query('campaign') campaign?: string,
    @Query('state_type') state_type?: string,
  ) {
    const state =
      state_type !== undefined ? parseInt(state_type, 10) : undefined;
    return this.service.findAll({
      environment,
      portfolio_type,
      campaign,
      state_type: Number.isNaN(state) ? undefined : state,
    });
  }

  @Get('environments')
  @ApiOperation({
    summary: 'Listar valores únicos de ambiente (dev, qa, pro, etc.)',
  })
  getEnvironments() {
    return this.service.getEnvironments();
  }

  @Get('portfolio-types')
  @ApiOperation({
    summary:
      'Listar valores únicos de tipo de cartera (propias, sudameris, etc.)',
  })
  getPortfolioTypes() {
    return this.service.getPortfolioTypes();
  }

  @Get('campaigns')
  @ApiOperation({
    summary: 'Listar valores únicos de campaña (tuya, claro, etc.)',
  })
  getCampaigns() {
    return this.service.getCampaigns();
  }

  @Get('state-types')
  @ApiOperation({
    summary: 'Listar valores únicos de estado (activo/inactivo)',
  })
  getStateTypes() {
    return this.service.getStateTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una configuración por id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una configuración' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConfigDataBasesDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una configuración' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
