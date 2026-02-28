// Responsabilidad: configuración de la conexión a la base de datos.

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { EnvironmentTypeEntity } from './entities/environmentType.entities';
import { EnvironmentTypeMigration1771978729001 } from './migrations/1771978729001_environmentType.migrations';
import { StateTypeEntity } from './entities/stateType.entities';
import { StateTypeMigration1771978729002 } from './migrations/1771978729002_stateType.migrations';
import { PortfolioTypeEntity } from './entities/portfolioType.entities';
import { PortfolioTypeMigration1771978729003 } from './migrations/1771978729003_portfolioType.migrations';
import { DataBasesEntity } from './entities/dataBases.entities';
import { DataBasesMigration1771978729004 } from './migrations/1771978729004_dataBases.migrations';
import { AttentionScheduleEntity } from './entities/attentionSchedule.entities';
import { AttentionScheduleMigration1771978729005 } from './migrations/1771978729005_attentionSchedule.migrations';
import { PortfolioCityConfigEntity } from './entities/portfolioCityConfig.entities';
import { PortfolioCityConfigMigration1771978729006 } from './migrations/1771978729006_portfolioCityConfig.migrations';

const dbPort = parseInt(process.env.DB_CONFIG_PORT ?? '3306', 10);

export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_CONFIG_HOST ?? 'localhost',
  port: Number.isNaN(dbPort) ? 3306 : dbPort,
  username: process.env.DB_CONFIG_USER ?? 'root',
  password: process.env.DB_CONFIG_PASSWORD ?? '',
  database: process.env.DB_CONFIG_DATABASE ?? 'bot_demandas_online',
  entities: [EnvironmentTypeEntity, StateTypeEntity, PortfolioTypeEntity, DataBasesEntity, AttentionScheduleEntity, PortfolioCityConfigEntity],
  migrations: [EnvironmentTypeMigration1771978729001, StateTypeMigration1771978729002, PortfolioTypeMigration1771978729003, DataBasesMigration1771978729004, AttentionScheduleMigration1771978729005, PortfolioCityConfigMigration1771978729006],
  synchronize: false,
  logging: process.env.DB_CONFIG_LOGGING === 'true',
});