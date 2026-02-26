// Responsabilidad: endpoints HTTP de Nest (controller).

import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { EnvironmentTypeDto, UpdateEnvironmentTypeDto } from '../dto/environmentType.dto';
import { EnvironmentTypeService } from '@application/services/environmentType.service';
import { EnvironmentType } from '@domain/entities/environmentType.entities';
import { CreateEnvironmentTypeInput } from '@domain/ports/environmentType.ports';

/** Ejemplo JSON que Swagger muestra por defecto en el body (guía visual para quien use la API). */
const createExampleSchema = {
    type: 'dev',
    detail: 'Dev environment registered',
    responsible: 'BOT demands online',
};

/** Ejemplo JSON para actualizar. El id va solo en la URL (path), no en el body. */
const updateExampleSchema = {
    type: 'dev',
    detail: 'Dev environment registered',
    responsible: 'BOT demands online',
};

@ApiTags('environmentType')
@Controller('environmentType')
export class EnvironmentTypeController {
    constructor(private readonly environmentTypeService: EnvironmentTypeService) {}
    // Crear un nuevo tipo de entorno
    @Post()
    @ApiOperation({ summary: 'Crear un nuevo tipo de entorno' })
    @ApiBody({
        description: 'El JSON de abajo sirve de guía.',
        schema: { allOf: [{ $ref: getSchemaPath(EnvironmentTypeDto) }], example: createExampleSchema },
    })
    async create(@Body() environmentTypeDto: EnvironmentTypeDto): Promise<EnvironmentTypeDto> {
        return this.environmentTypeService.create(environmentTypeDto as CreateEnvironmentTypeInput);
    }
    // Obtener todos los tipos de entorno
    @Get()
    @ApiOperation({ summary: 'Obtener todos los tipos de entorno' })
    async findAll(): Promise<EnvironmentTypeDto[]> {
        return this.environmentTypeService.findAll();
    }
    // Obtener un tipo de entorno por su type (ruta fija antes de :id)
    @Get('byType/:type')
    @ApiOperation({ summary: 'Obtener un tipo de entorno por su type' })
    async findByType(@Param('type') type: string): Promise<EnvironmentTypeDto> {
        return this.environmentTypeService.findByType(type);
    }
    // Obtener un tipo de entorno por su id
    @Get(':id')
    @ApiOperation({ summary: 'Obtener un tipo de entorno por su id' })
    async findById(@Param('id') id: number): Promise<EnvironmentTypeDto> {
        return this.environmentTypeService.findById(id);
    }
    // Actualizar un tipo de entorno
    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un tipo de entorno' })
    @ApiBody({
        description: 'El JSON de abajo sirve de guía.',
        schema: { allOf: [{ $ref: getSchemaPath(UpdateEnvironmentTypeDto) }], example: updateExampleSchema },
    })
    async update(@Param('id') id: number, @Body() body: UpdateEnvironmentTypeDto): Promise<EnvironmentTypeDto> {
        return this.environmentTypeService.update({ ...body, id: Number(id) } as EnvironmentType);
    }
    // Eliminar un tipo de entorno
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un tipo de entorno' })
    async delete(@Param('id') id: number): Promise<void> {
        return this.environmentTypeService.delete(id);
    }
}

