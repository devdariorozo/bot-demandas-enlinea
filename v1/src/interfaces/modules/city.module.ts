// Responsabilidad: módulo Nest para City.

import { Module } from '@nestjs/common';
import { CityController } from '../http/controller/city.controller';
import { CityService } from '@application/services/city.service';
import { CityRepositoryImpl } from '@infrastructure/persistence/repositories/city.repositories';
import { CITY_REPOSITORY } from '@domain/ports/city.ports';
import { DepartamentModule } from './departament.module';
import { StateTypeModule } from './stateType.module';

@Module({
  controllers: [CityController],
  providers: [
    CityService,
    {
      provide: CITY_REPOSITORY,
      useClass: CityRepositoryImpl,
    },
  ],
  imports: [DepartamentModule, StateTypeModule],
  exports: [
    CityService,
    { provide: CITY_REPOSITORY, useClass: CityRepositoryImpl },
  ],
})
export class CityModule {}

