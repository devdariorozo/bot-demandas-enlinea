//===============================================================
// Modulo de configuración de bases de datos
//===============================================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigDataBasesEntity } from '@infrastructure/persistence/entities/administration/configuration/databases/databases.entitiesy';
import { ConfigDataBasesRepository } from '@infrastructure/persistence/repositories/administration/configuration/databases/databases.repositories';
import { CONFIG_DATA_BASES_REPOSITORY } from '@domain/ports/administration/configuration/databases/databases.port';
import { ConfigDataBasesService } from '@application/services/administration/configuration/databases/databases.service';
import { ConfigDataBasesController } from '@interfaces/http/controllers/administration/configuration/databases/databases.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConfigDataBasesEntity]),
  ],
  controllers: [ConfigDataBasesController],
  providers: [
    ConfigDataBasesService,
    {
      provide: CONFIG_DATA_BASES_REPOSITORY,
      useClass: ConfigDataBasesRepository,
    },
  ],
  exports: [ConfigDataBasesService],
})
export class DatabasesModule {}