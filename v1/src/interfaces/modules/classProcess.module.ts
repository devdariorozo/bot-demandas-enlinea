// Responsabilidad: módulo Nest para class_process (depende de specialty_process y state_type).

import { Module } from '@nestjs/common';
import { ClassProcessController } from '../http/controller/classProcess.controller';
import { ClassProcessService } from '@application/services/classProcess.service';
import { ClassProcessRepositoryImpl } from '@infrastructure/persistence/repositories/classProcess.repositories';
import { CLASS_PROCESS_REPOSITORY } from '@domain/ports/classProcess.ports';
import { StateTypeModule } from './stateType.module';
import { SpecialtyProcessModule } from './specialtyProcess.module';

@Module({
  controllers: [ClassProcessController],
  providers: [
    ClassProcessService,
    {
      provide: CLASS_PROCESS_REPOSITORY,
      useClass: ClassProcessRepositoryImpl,
    },
  ],
  exports: [
    ClassProcessService,
    { provide: CLASS_PROCESS_REPOSITORY, useClass: ClassProcessRepositoryImpl },
  ],
  imports: [StateTypeModule, SpecialtyProcessModule],
})
export class ClassProcessModule {}
