import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './interfaces/modules/health.module';
import { AdminModule } from './interfaces/modules/admin.module';
import { ConfigDataBasesEntity } from './infrastructure/persistence/entities/config-data-bases.entity';

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
        entities: [ConfigDataBasesEntity],
        migrations: [],
        migrationsTableName: 'migrations',
        synchronize: false,
        logging: config.get('DB_CONFIG_LOGGING') === 'true',
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    AdminModule,
    // DemandaModule, CarteraModule, ConfigModule (horarios) - a implementar
  ],
})
export class AppModule {}
