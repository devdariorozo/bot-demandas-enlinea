// Responsabilidad: punto de entrada de la aplicación.

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { EnvironmentTypeDto, UpdateEnvironmentTypeDto } from '@interfaces/http/dto/environmentType.dto';
import { StateTypeDto, UpdateStateTypeDto } from '@interfaces/http/dto/stateType.dto';
import { PortfolioTypeDto, UpdatePortfolioTypeDto } from '@interfaces/http/dto/portfolioType.dto';
import { CampaingTypeDto, UpdateCampaingTypeDto } from '@interfaces/http/dto/campaingType.dto';
import { DataBasesDto, UpdateDataBasesDto } from '@interfaces/http/dto/dataBases.dto';
import { AttentionScheduleDto, UpdateAttentionScheduleDto } from '@interfaces/http/dto/attentionSchedule.dto';
import { DepartamentDto, UpdateDepartamentDto } from '@interfaces/http/dto/departament.dto';
import { CityDto, UpdateCityDto } from '@interfaces/http/dto/city.dto';
import { ClassProcessConfigDto, UpdateClassProcessConfigDto } from '@interfaces/http/dto/classProcessConfig.dto';
import { SpecialtyProcessDto, UpdateSpecialtyProcessDto } from '@interfaces/http/dto/specialtyProcess.dto';
import { ClassProcessDto, UpdateClassProcessDto } from '@interfaces/http/dto/classProcess.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Prefijo global para todas las rutas HTTP
  app.setGlobalPrefix(process.env.GLOBAL_PREFIX ?? 'api/v1');

  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerTitle =
    process.env.NOMBRE_SERVICIO_SWAGGER ?? 'Bot Demandas en Línea';

  const config = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setDescription(
      `Este proyecto es un bot desarrollado en Node.js que automatiza la radicación de demandas en línea en el portal oficial de la Rama Judicial de Colombia (https://procesojudicial.ramajudicial.gov.co/demandaenlinea). El bot simula el flujo que hoy realiza un usuario humano: acepta los términos y condiciones del modal inicial, diligencia los campos de los 6 bloques del formulario (selects, textos, sujetos procesales, adjuntos), interactúa con el reCAPTCHA (resolución vía Browserless) y finalmente envía la demanda, minimizando errores manuales y tiempos operativos.

La ejecución se realiza únicamente en horarios y días laborales configurados: inicialmente lunes a viernes de 08:00 a 12:00 y de 13:00 a 17:00, excluyendo fines de semana y festivos en Colombia. Un módulo de configuración de horarios y días laborales centraliza esta lógica y permitirá ajustes desde un frontend en versiones posteriores.

El sistema está pensado para ser escalable por carteras. En el MVP se trabaja con un primer tipo de cartera: Carteras Propias. Posteriormente se incorporarán otras carteras (por ejemplo Carteras Sudameris) con sus propias estrategias de radicación y fuentes de datos, sin modificar el núcleo del sistema gracias a la arquitectura hexagonal y al uso de estrategias por cartera.`,
    )
    .setVersion('1.0')
    .addTag('api', 'Verificación del servicio')
    .addTag('environmentType', 'Tipo de entorno que se puede tener en el sistema')
    .addTag('stateType', 'Tipo de estado que puede tener un registro')
    .addTag('portfolioType', 'Tipo de cartera que se puede tener en el sistema')
    .addTag('campaingType', 'Tipo de campaña que se puede tener en el sistema')
    .addTag('dataBases', 'Configuración de bases de datos por entorno, cartera y campaña')
    .addTag('attentionSchedule', 'Horarios de atención por cartera y campaña')
    .addTag('departament', 'Departamentos disponibles en la radicación de demandas')
    .addTag('city', 'Ciudades disponibles en la radicación de demandas')
    .addTag('specialtyProcess', 'Especialidades de proceso disponibles en la radicación de demandas')
    .addTag('classProcess', 'Clases de proceso disponibles en la radicación de demandas')
    .addTag('classProcessConfig', 'Configuración de clases de proceso por cartera y campaña')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      EnvironmentTypeDto,
      UpdateEnvironmentTypeDto,
      StateTypeDto,
      UpdateStateTypeDto,
      PortfolioTypeDto,
      UpdatePortfolioTypeDto,
      CampaingTypeDto,
      UpdateCampaingTypeDto,
      DataBasesDto,
      UpdateDataBasesDto,
      AttentionScheduleDto,
      UpdateAttentionScheduleDto,
      DepartamentDto,
      UpdateDepartamentDto,
      CityDto,
      UpdateCityDto,
      SpecialtyProcessDto,
      UpdateSpecialtyProcessDto,
      ClassProcessDto,
      UpdateClassProcessDto,
      ClassProcessConfigDto,
      UpdateClassProcessConfigDto,
    ],
  });
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT_API ?? 5006;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger UI: http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Error al iniciar la aplicación', err as Error);
  process.exit(1);
});
