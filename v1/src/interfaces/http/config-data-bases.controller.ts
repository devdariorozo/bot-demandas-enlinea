import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigDataBasesService } from '../../application/services/config-data-bases.service';
import { CreateConfigDataBasesDto, UpdateConfigDataBasesDto } from './dto/config-data-bases';

@ApiTags('admin')
@Controller('admin/config-data-bases')
export class ConfigDataBasesController {
  constructor(private readonly configDataBasesService: ConfigDataBasesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear configuración de bases de datos' })
  create(@Body() createDto: CreateConfigDataBasesDto) {
    return this.configDataBasesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar configuraciones (con filtros opcionales)' })
  findAll(
    @Query('environment') environment?: string,
    @Query('portfolio_type') portfolio_type?: string,
    @Query('campaign') campaign?: string,
    @Query('state_type') state_type?: string,
  ) {
    const state = state_type !== undefined ? parseInt(state_type, 10) : undefined;
    return this.configDataBasesService.findAll({
      environment,
      portfolio_type,
      campaign,
      state_type: Number.isNaN(state) ? undefined : state,
    });
  }

  @Get('environments')
  @ApiOperation({ summary: 'Listar valores únicos de ambiente (dev, qa, pro, etc.)' })
  getEnvironments() {
    return this.configDataBasesService.getEnvironments();
  }

  @Get('portfolio-types')
  @ApiOperation({ summary: 'Listar valores únicos de tipo de cartera (propias, sudameris, etc.)' })
  getPortfolioTypes() {
    return this.configDataBasesService.getPortfolioTypes();
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Listar valores únicos de campaña (tuya, claro, etc.)' })
  getCampaigns() {
    return this.configDataBasesService.getCampaigns();
  }

  @Get('state-types')
  @ApiOperation({ summary: 'Listar valores únicos de estado (activo/inactivo)' })
  getStateTypes() {
    return this.configDataBasesService.getStateTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una configuración por id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.configDataBasesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una configuración' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateConfigDataBasesDto,
  ) {
    return this.configDataBasesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una configuración' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.configDataBasesService.remove(id);
  }
}
