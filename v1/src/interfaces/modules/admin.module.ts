import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigDataBasesEntity } from '../../infrastructure/persistence/entities/config-data-bases.entity';
import { ConfigDataBasesRepository } from '../../infrastructure/persistence/repositories/config-data-bases.repository';
import { CONFIG_DATA_BASES_REPOSITORY } from '../../domain/ports/config-data-bases.repository.port';
import { ConfigDataBasesService } from '../../application/services/config-data-bases.service';
import { ConfigDataBasesController } from '../http/config-data-bases.controller';

/**
 * Módulo administrador: configuración de bases de datos, y en el futuro
 * días y horarios de atención por tipo de cartera y campaña.
 */
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
export class AdminModule {}
