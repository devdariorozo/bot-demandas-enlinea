// Responsabilidad: configuración de la conexión a la base de datos.

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { StateTypeEntity } from './entities/stateType.entities';
import { StateTypeMigration1771978729006 } from './migrations/1771978729006_stateType.migrations';
import { PortfolioTypeEntity } from './entities/portfolioType.entities';
import { PortfolioTypeMigration1771978729007 } from './migrations/1771978729007_portfolioType.migrations';

const dbPort = parseInt(process.env.DB_CONFIG_PORT ?? '3306', 10);

export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_CONFIG_HOST ?? 'localhost',
  port: Number.isNaN(dbPort) ? 3306 : dbPort,
  username: process.env.DB_CONFIG_USER ?? 'root',
  password: process.env.DB_CONFIG_PASSWORD ?? '',
  database: process.env.DB_CONFIG_DATABASE ?? 'bot_demandas_online',
  entities: [StateTypeEntity, PortfolioTypeEntity],
  migrations: [StateTypeMigration1771978729006, PortfolioTypeMigration1771978729007],
  synchronize: false,
  logging: process.env.DB_CONFIG_LOGGING === 'true',
});