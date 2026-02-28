// Responsabilidad: endpoints HTTP de Nest (controller).

import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { StateTypeDto, UpdateStateTypeDto } from '../dto/stateType.dto';
import { StateTypeService } from '@application/services/stateType.service';
import { StateType } from '@domain/entities/stateType.entities';

/** Ejemplo JSON que Swagger muestra por defecto en el body (guía visual para quien use la API). */
const createExampleSchema = {
    type: 'Active',
    detail: 'Registro activo',
    responsible: 'BOT demands online',
};

/** Ejemplo JSON para actualizar. El id va solo en la URL (path), no en el body. */
const updateExampleSchema = {
    type: 'Active',
    detail: 'Registro activo',
    responsible: 'BOT demands online',
};

@ApiTags('stateType')
@Controller('stateType')
export class StateTypeController {
    constructor(private readonly stateTypeService: StateTypeService) {}
    // Crear un nuevo tipo de estado
    @Post()
    @ApiOperation({ summary: 'Crear un nuevo tipo de estado' })
    @ApiBody({
        description: 'El JSON de abajo sirve de guía.',
        schema: { allOf: [{ $ref: getSchemaPath(StateTypeDto) }], example: createExampleSchema },
    })
    async create(@Body() stateTypeDto: StateTypeDto): Promise<StateTypeDto> {
        return this.stateTypeService.create(stateTypeDto);
    }
    // Obtener todos los tipos de estado
    @Get()
    @ApiOperation({ summary: 'Obtener todos los tipos de estado' })
    async findAll(): Promise<StateTypeDto[]> {
        return this.stateTypeService.findAll();
    }
    // Obtener un tipo de estado por su type (ruta fija antes de :id)
    @Get('byType/:type')
    @ApiOperation({ summary: 'Obtener un tipo de estado por su type' })
    async findByType(@Param('type') type: string): Promise<StateTypeDto> {
        return this.stateTypeService.findByType(type);
    }
    // Obtener un tipo de estado por su id
    @Get(':id')
    @ApiOperation({ summary: 'Obtener un tipo de estado por su id' })
    async findById(@Param('id') id: number): Promise<StateTypeDto> {
        return this.stateTypeService.findById(id);
    }
    // Actualizar un tipo de estado
    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un tipo de estado' })
    @ApiBody({
        description: 'El JSON de abajo sirve de guía.',
        schema: { allOf: [{ $ref: getSchemaPath(UpdateStateTypeDto) }], example: updateExampleSchema },
    })
    async update(@Param('id') id: number, @Body() body: UpdateStateTypeDto): Promise<StateTypeDto> {
        return this.stateTypeService.update({ ...body, id: Number(id) } as StateType);
    }
    // Eliminar un tipo de estado
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un tipo de estado' })
    async delete(@Param('id') id: number): Promise<void> {
        return this.stateTypeService.delete(id);
    }
}