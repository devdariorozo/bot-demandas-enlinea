// Responsabilidad: módulo Nest para Departament.

import { Module } from '@nestjs/common';
import { DepartamentController } from '../http/controller/departament.controller';
import { DepartamentService } from '@application/services/departament.service';
import { DepartamentRepositoryImpl } from '@infrastructure/persistence/repositories/departament.repositories';
import { DEPARTAMENT_REPOSITORY } from '@domain/ports/departament.ports';
import { StateTypeModule } from './stateType.module';

@Module({
  controllers: [DepartamentController],
  providers: [
    DepartamentService,
    {
      provide: DEPARTAMENT_REPOSITORY,
      useClass: DepartamentRepositoryImpl,
    },
  ],
  imports: [StateTypeModule],
  exports: [
    DepartamentService,
    { provide: DEPARTAMENT_REPOSITORY, useClass: DepartamentRepositoryImpl },
  ],
})
export class DepartamentModule {}

