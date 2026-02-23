import { config } from 'dotenv';
import { DataSource } from 'typeorm';

// Cargar .env cuando se ejecuta el CLI de TypeORM (migraciones/seeds)
config({ path: '.env' });

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_CONFIG_HOST ?? 'localhost',
  port: parseInt(process.env.DB_CONFIG_PORT ?? '3306', 10),
  username: process.env.DB_CONFIG_USER ?? 'root',
  password: process.env.DB_CONFIG_PASSWORD ?? '',
  database: process.env.DB_CONFIG_DATABASE ?? 'dbd_demands_online',
  migrations: ['src/infrastructure/persistence/migrations/**/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: process.env.DB_CONFIG_LOGGING === 'true',
});
