// Responsabilidad: endpoints HTTP de Nest (controller).

import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { CampaingTypeDto, UpdateCampaingTypeDto } from '../dto/campaingType.dto';
import { CampaingTypeService } from '@application/services/campaingType.service';
import { CampaingType } from '@domain/entities/campaingType.entities';
import { CreateCampaingTypeInput } from '@domain/ports/campaingType.ports';

/** Ejemplo JSON que Swagger muestra por defecto en el body (guía visual para quien use la API). */
const createExampleSchema = {
    type: 'Claro',
    detail: 'Campaña Claro registrada',
    state_type_id: 1,
    responsible: 'BOT demands online',
};

/** Ejemplo JSON para actualizar. El id va solo en la URL (path), no en el body. */
const updateExampleSchema = {
    type: 'Claro',
    detail: 'Campaña Claro registrada',
    state_type_id: 1,
    responsible: 'BOT demands online',
};

@ApiTags('campaingType')
@Controller('campaingType')
export class CampaingTypeController {
    constructor(private readonly campaingTypeService: CampaingTypeService) {}
    // Crear un nuevo tipo de campaña
    @Post()
    @ApiOperation({ summary: 'Crear un nuevo tipo de campaña' })
    @ApiBody({
        description: 'El JSON de abajo sirve de guía.',
        schema: { allOf: [{ $ref: getSchemaPath(CampaingTypeDto) }], example: createExampleSchema },
    })
    async create(@Body() campaingTypeDto: CampaingTypeDto): Promise<CampaingTypeDto> {
        return this.campaingTypeService.create(campaingTypeDto as CreateCampaingTypeInput);
    }
    // Obtener todos los tipos de campaña
    @Get()
    @ApiOperation({ summary: 'Obtener todos los tipos de campaña' })
    async findAll(): Promise<CampaingTypeDto[]> {
        return this.campaingTypeService.findAll();
    }
    // Obtener un tipo de campaña por su type (ruta fija antes de :id)
    @Get('byType/:type')
    @ApiOperation({ summary: 'Obtener un tipo de campaña por su type' })
    async findByType(@Param('type') type: string): Promise<CampaingTypeDto> {
        return this.campaingTypeService.findByType(type);
    }
    // Obtener un tipo de campaña por su id
    @Get(':id')
    @ApiOperation({ summary: 'Obtener un tipo de campaña por su id' })
    async findById(@Param('id') id: number): Promise<CampaingTypeDto> {
        return this.campaingTypeService.findById(id);
    }
    // Actualizar un tipo de campaña
    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un tipo de campaña' })
    @ApiBody({
        description: 'El JSON de abajo sirve de guía.',
        schema: { allOf: [{ $ref: getSchemaPath(UpdateCampaingTypeDto) }], example: updateExampleSchema },
    })
    async update(@Param('id') id: number, @Body() body: UpdateCampaingTypeDto): Promise<CampaingTypeDto> {
        return this.campaingTypeService.update({ ...body, id: Number(id) } as CampaingType);
    }
    // Eliminar un tipo de campaña
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un tipo de campaña' })
    async delete(@Param('id') id: number): Promise<void> {
        return this.campaingTypeService.delete(id);
    }
}