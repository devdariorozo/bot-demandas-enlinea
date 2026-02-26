// Responsabilidad: módulo Nest para specialty_process.

import { Module } from '@nestjs/common';
import { SpecialtyProcessController } from '../http/controller/specialtyProcess.controller';
import { SpecialtyProcessService } from '@application/services/specialtyProcess.service';
import { SpecialtyProcessRepositoryImpl } from '@infrastructure/persistence/repositories/specialtyProcess.repositories';
import { SPECIALTY_PROCESS_REPOSITORY } from '@domain/ports/specialtyProcess.ports';
import { StateTypeModule } from './stateType.module';
import { StateTypeService } from '@application/services/stateType.service';
import { STATE_TYPE_REPOSITORY } from '@domain/ports/stateType.ports';
import { StateTypeRepositoryImpl } from '@infrastructure/persistence/repositories/stateType.repositories';

@Module({
  controllers: [SpecialtyProcessController],
  providers: [
    SpecialtyProcessService,
    StateTypeService,
    {
      provide: SPECIALTY_PROCESS_REPOSITORY,
      useClass: SpecialtyProcessRepositoryImpl,
    },
    {
      provide: STATE_TYPE_REPOSITORY,
      useClass: StateTypeRepositoryImpl,
    },
  ],
  exports: [
    SpecialtyProcessService,
    { provide: SPECIALTY_PROCESS_REPOSITORY, useClass: SpecialtyProcessRepositoryImpl },
    { provide: STATE_TYPE_REPOSITORY, useClass: StateTypeRepositoryImpl },
  ],
  imports: [StateTypeModule],
})
export class SpecialtyProcessModule {}

