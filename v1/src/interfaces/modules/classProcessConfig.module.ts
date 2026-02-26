// Responsabilidad: módulo Nest para ClassProcessConfig.

import { Module } from '@nestjs/common';
import { ClassProcessConfigController } from '../http/controller/classProcessConfig.controller';
import { ClassProcessConfigService } from '@application/services/classProcessConfig.service';
import { ClassProcessConfigRepositoryImpl } from '@infrastructure/persistence/repositories/classProcessConfig.repositories';
import { CLASS_PROCESS_CONFIG_REPOSITORY } from '@domain/ports/classProcessConfig.ports';
import { PortfolioTypeModule } from './portfolioType.module';
import { CampaingTypeModule } from './campaingType.module';
import { StateTypeModule } from './stateType.module';
import { ClassProcessModule } from './classProcess.module';

@Module({
  controllers: [ClassProcessConfigController],
  providers: [
    ClassProcessConfigService,
    {
      provide: CLASS_PROCESS_CONFIG_REPOSITORY,
      useClass: ClassProcessConfigRepositoryImpl,
    },
  ],
  imports: [PortfolioTypeModule, CampaingTypeModule, StateTypeModule, ClassProcessModule],
  exports: [
    ClassProcessConfigService,
    { provide: CLASS_PROCESS_CONFIG_REPOSITORY, useClass: ClassProcessConfigRepositoryImpl },
  ],
})
export class ClassProcessConfigModule {}
