// Responsabilidad: módulo principal de la aplicación.

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './interfaces/modules/health.module';
import { StateTypeEntity } from './infrastructure/persistence/entities/stateType.entities';
import { StateTypeModule } from './interfaces/modules/stateType.module';
import { PortfolioTypeEntity } from './infrastructure/persistence/entities/portfolioType.entities';
import { PortfolioTypeModule } from './interfaces/modules/portfolioType.module';
import { CampaingTypeModule } from './interfaces/modules/campaingType.module';
import { CampaingTypeEntity } from './infrastructure/persistence/entities/campaingType.entities';
import { EnvironmentTypeEntity } from './infrastructure/persistence/entities/environmentType.entities';
import { EnvironmentTypeModule } from './interfaces/modules/environmentType.module';
import { EnvironmentTypeMigration1771978729005 } from '@infrastructure/persistence/migrations/1771978729005_environmentType.migrations';
import { StateTypeMigration1771978729006 } from '@infrastructure/persistence/migrations/1771978729006_stateType.migrations';
import { PortfolioTypeMigration1771978729007 } from '@infrastructure/persistence/migrations/1771978729007_portfolioType.migrations';
import { CampaingTypeMigration1771978729008 } from '@infrastructure/persistence/migrations/1771978729008_campaingType.migrations';
import { DataBasesEntity } from './infrastructure/persistence/entities/dataBases.entities';
import { DataBasesMigration1771978729009 } from '@infrastructure/persistence/migrations/1771978729009_dataBases.migrations';
import { DataBasesModule } from './interfaces/modules/dataBases.module';
import { AttentionScheduleEntity } from './infrastructure/persistence/entities/attentionSchedule.entities';
import { AttentionScheduleMigration1771978729010 } from '@infrastructure/persistence/migrations/1771978729010_attentionSchedule.migrations';
import { AttentionScheduleModule } from './interfaces/modules/attentionSchedule.module';
import { DepartamentEntity } from './infrastructure/persistence/entities/departament.entities';
import { DepartamentMigration1771978729011 } from '@infrastructure/persistence/migrations/1771978729011_departament.migrations';
import { DepartamentModule } from './interfaces/modules/departament.module';
import { CityEntity } from './infrastructure/persistence/entities/city.entities';
import { CityMigration1771978729012 } from '@infrastructure/persistence/migrations/1771978729012_city.migrations';
import { CityModule } from './interfaces/modules/city.module';
import { SpecialtyProcessEntity } from './infrastructure/persistence/entities/specialtyProcess.entities';
import { SpecialtyProcessMigration1771978729013 } from '@infrastructure/persistence/migrations/1771978729013_specialtyProcess.migrations';
import { ClassProcessEntity } from './infrastructure/persistence/entities/classProcess.entities';
import { ClassProcessMigration1771978729014 } from '@infrastructure/persistence/migrations/1771978729014_classProcess.migrations';
import { ClassProcessConfigEntity } from './infrastructure/persistence/entities/classProcessConfig.entities';
import { ClassProcessConfigMigration1771978729015 } from '@infrastructure/persistence/migrations/1771978729015_classProcessConfig.migrations';
import { SpecialtyProcessModule } from './interfaces/modules/specialtyProcess.module';
import { ClassProcessModule } from './interfaces/modules/classProcess.module';
import { ClassProcessConfigModule } from './interfaces/modules/classProcessConfig.module';

@Module({
  imports: [
    ConfigModule.forRoot({  
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_CONFIG_HOST', 'localhost'),
        port: config.get<number>('DB_CONFIG_PORT', 3306),
        username: config.get('DB_CONFIG_USER', 'root'),
        password: config.get('DB_CONFIG_PASSWORD', ''),
        database: config.get('DB_CONFIG_DATABASE', 'dbd_demands_online'),
        entities: [EnvironmentTypeEntity, StateTypeEntity, PortfolioTypeEntity, CampaingTypeEntity, DataBasesEntity, AttentionScheduleEntity, DepartamentEntity, CityEntity, SpecialtyProcessEntity, ClassProcessEntity, ClassProcessConfigEntity],
        migrations: [EnvironmentTypeMigration1771978729005, StateTypeMigration1771978729006, PortfolioTypeMigration1771978729007, CampaingTypeMigration1771978729008, DataBasesMigration1771978729009, AttentionScheduleMigration1771978729010, DepartamentMigration1771978729011, CityMigration1771978729012, SpecialtyProcessMigration1771978729013, ClassProcessMigration1771978729014, ClassProcessConfigMigration1771978729015],
        migrationsTableName: 'migrations',
        synchronize: false,
        logging: config.get('DB_CONFIG_LOGGING') === 'true',
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    EnvironmentTypeModule,
    StateTypeModule,
    PortfolioTypeModule,
    CampaingTypeModule,
    DataBasesModule,
    AttentionScheduleModule,
    DepartamentModule,
    CityModule,
    SpecialtyProcessModule,
    ClassProcessModule,
    ClassProcessConfigModule,
  ],
})
export class AppModule {}
