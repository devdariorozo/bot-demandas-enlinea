// Responsabilidad: endpoints HTTP de Nest (controller).

import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ClassProcessDto, UpdateClassProcessDto } from '@interfaces/http/dto/classProcess.dto';
import { ClassProcessService } from '@application/services/classProcess.service';
import { ClassProcess } from '@domain/entities/classProcess.entities';
import { CreateClassProcessInput } from '@domain/ports/classProcess.ports';

/** Ejemplo para crear (especialidad id 3). */
const createExampleSchema = {
  specialty_process_id: 3,
  type: '41-03-08 EJECUTIVO DE MÍNIMA CUANTÍA',
  detail: 'Ejecutivo de mínima cuantía registrado',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

/** Ejemplo para actualizar. */
const updateExampleSchema = {
  specialty_process_id: 3,
  type: '41-03-08 EJECUTIVO DE MÍNIMA CUANTÍA',
  detail: 'Ejecutivo de mínima cuantía registrado',
  state_type_id: 1,
  responsible: 'BOT demands online',
};

@ApiTags('classProcess')
@Controller('classProcess')
export class ClassProcessController {
  constructor(private readonly classProcessService: ClassProcessService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva clase de proceso' })
  @ApiBody({
    description: 'Clase de proceso asociada a una especialidad activa.',
    schema: { allOf: [{ $ref: getSchemaPath(ClassProcessDto) }], example: createExampleSchema },
  })
  async create(@Body() dto: ClassProcessDto): Promise<ClassProcessDto> {
    return this.classProcessService.create(dto as CreateClassProcessInput);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las clases de proceso' })
  async findAll(): Promise<ClassProcessDto[]> {
    return this.classProcessService.findAll();
  }

  @Get('bySpecialty/:specialtyProcessId')
  @ApiOperation({ summary: 'Catálogo de clases de proceso por especialidad (para otros módulos)' })
  async findBySpecialtyId(@Param('specialtyProcessId') specialtyProcessId: number): Promise<ClassProcessDto[]> {
    return this.classProcessService.findBySpecialtyId(Number(specialtyProcessId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una clase de proceso por id' })
  async findById(@Param('id') id: number): Promise<ClassProcessDto> {
    return this.classProcessService.findById(Number(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una clase de proceso (o inactivar cambiando state_type_id)' })
  @ApiBody({
    description: 'Campos a actualizar.',
    schema: { allOf: [{ $ref: getSchemaPath(UpdateClassProcessDto) }], example: updateExampleSchema },
  })
  async update(
    @Param('id') id: number,
    @Body() body: UpdateClassProcessDto,
  ): Promise<ClassProcessDto> {
    return this.classProcessService.update({ ...body, id: Number(id) } as ClassProcess);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una clase de proceso' })
  async delete(@Param('id') id: number): Promise<void> {
    return this.classProcessService.delete(Number(id));
  }
}
