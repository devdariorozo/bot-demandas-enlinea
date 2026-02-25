// Responsabilidad: endpoints HTTP de Nest (controller).

import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { PortfolioTypeDto, UpdatePortfolioTypeDto } from '../dto/portfolioType.dto';
import { PortfolioTypeService } from '@application/services/portfolioType.service';
import { PortfolioType } from '@domain/entities/portfolioType.entities';
import { CreatePortfolioTypeInput } from '@domain/ports/portfolioType.ports';

/** Ejemplo JSON que Swagger muestra por defecto en el body (guía visual para quien use la API). */
const createExampleSchema = {
    type: 'Propias',
    detail: 'Propias registered',
    state_type_id: 1,
    responsible: 'BOT demands online',
};

/** Ejemplo JSON para actualizar. El id va solo en la URL (path), no en el body. */
const updateExampleSchema = {
    type: 'Propias',
    detail: 'Propias registered',
    state_type_id: 1,
    responsible: 'BOT demands online',
};

@ApiTags('portfolioType')
@Controller('portfolioType')
export class PortfolioTypeController {
    constructor(private readonly portfolioTypeService: PortfolioTypeService) {}
    // Crear un nuevo tipo de cartera
    @Post()
    @ApiOperation({ summary: 'Crear un nuevo tipo de cartera' })
    @ApiBody({
        description: 'El JSON de abajo sirve de guía.',
        schema: { allOf: [{ $ref: getSchemaPath(PortfolioTypeDto) }], example: createExampleSchema },
    })
    async create(@Body() portfolioTypeDto: PortfolioTypeDto): Promise<PortfolioTypeDto> {
        return this.portfolioTypeService.create(portfolioTypeDto as CreatePortfolioTypeInput);
    }
    // Obtener todos los tipos de cartera
    @Get()
    @ApiOperation({ summary: 'Obtener todos los tipos de cartera' })
    async findAll(): Promise<PortfolioTypeDto[]> {
        return this.portfolioTypeService.findAll();
    }
    // Obtener un tipo de cartera por su id
    @Get(':id')
    @ApiOperation({ summary: 'Obtener un tipo de cartera por su id' })
    async findById(@Param('id') id: number): Promise<PortfolioTypeDto> {
        return this.portfolioTypeService.findById(id);
    }
    // Obtener un tipo de cartera por su type
    @Get('type/:type')
    @ApiOperation({ summary: 'Obtener un tipo de cartera por su type' })
    async findByType(@Param('type') type: string): Promise<PortfolioTypeDto> {
        return this.portfolioTypeService.findByType(type);
    }
    // Actualizar un tipo de cartera
    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un tipo de cartera' })
    @ApiBody({
        description: 'El JSON de abajo sirve de guía.',
        schema: { allOf: [{ $ref: getSchemaPath(UpdatePortfolioTypeDto) }], example: updateExampleSchema },
    })
    async update(@Param('id') id: number, @Body() body: UpdatePortfolioTypeDto): Promise<PortfolioTypeDto> {
        return this.portfolioTypeService.update({ ...body, id: Number(id) } as PortfolioType);
    }
    // Eliminar un tipo de cartera
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un tipo de cartera' })
    async delete(@Param('id') id: number): Promise<void> {
        return this.portfolioTypeService.delete(id);
    }
}