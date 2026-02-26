// Responsabilidad: configuración de la conexión a la base de datos.

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { EnvironmentTypeEntity } from './entities/environmentType.entities';
import { EnvironmentTypeMigration1771978729005 } from './migrations/1771978729005_environmentType.migrations';
import { StateTypeEntity } from './entities/stateType.entities';
import { StateTypeMigration1771978729006 } from './migrations/1771978729006_stateType.migrations';
import { PortfolioTypeEntity } from './entities/portfolioType.entities';
import { PortfolioTypeMigration1771978729007 } from './migrations/1771978729007_portfolioType.migrations';
import { CampaingTypeEntity } from './entities/campaingType.entities';
import { CampaingTypeMigration1771978729008 } from './migrations/1771978729008_campaingType.migrations';
import { DataBasesEntity } from './entities/dataBases.entities';
import { DataBasesMigration1771978729009 } from './migrations/1771978729009_dataBases.migrations';
import { AttentionScheduleEntity } from './entities/attentionSchedule.entities';
import { AttentionScheduleMigration1771978729010 } from './migrations/1771978729010_attentionSchedule.migrations';
import { DepartamentEntity } from './entities/departament.entities';
import { DepartamentMigration1771978729011 } from './migrations/1771978729011_departament.migrations';
import { CityEntity } from './entities/city.entities';
import { CityMigration1771978729012 } from './migrations/1771978729012_city.migrations';
import { SpecialtyProcessEntity } from './entities/specialtyProcess.entities';
import { SpecialtyProcessMigration1771978729013 } from './migrations/1771978729013_specialtyProcess.migrations';
import { ClassProcessEntity } from './entities/classProcess.entities';
import { ClassProcessMigration1771978729014 } from './migrations/1771978729014_classProcess.migrations';
import { ClassProcessConfigEntity } from './entities/classProcessConfig.entities';
import { ClassProcessConfigMigration1771978729015 } from './migrations/1771978729015_classProcessConfig.migrations';

const dbPort = parseInt(process.env.DB_CONFIG_PORT ?? '3306', 10);

export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_CONFIG_HOST ?? 'localhost',
  port: Number.isNaN(dbPort) ? 3306 : dbPort,
  username: process.env.DB_CONFIG_USER ?? 'root',
  password: process.env.DB_CONFIG_PASSWORD ?? '',
  database: process.env.DB_CONFIG_DATABASE ?? 'bot_demandas_online',
  entities: [EnvironmentTypeEntity, StateTypeEntity, PortfolioTypeEntity, CampaingTypeEntity, DataBasesEntity, AttentionScheduleEntity, DepartamentEntity, CityEntity, SpecialtyProcessEntity, ClassProcessEntity, ClassProcessConfigEntity],
  migrations: [EnvironmentTypeMigration1771978729005, StateTypeMigration1771978729006, PortfolioTypeMigration1771978729007, CampaingTypeMigration1771978729008, DataBasesMigration1771978729009, AttentionScheduleMigration1771978729010, DepartamentMigration1771978729011, CityMigration1771978729012, SpecialtyProcessMigration1771978729013, ClassProcessMigration1771978729014, ClassProcessConfigMigration1771978729015],
  synchronize: false,
  logging: process.env.DB_CONFIG_LOGGING === 'true',
});