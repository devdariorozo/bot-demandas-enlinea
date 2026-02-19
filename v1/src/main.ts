import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

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
    .addTag('health', 'Verificación del servicio')
    .addTag('demandas', 'Radicación y consulta de demandas')
    .addTag('carteras', 'Carteras y campañas')
    .addTag('config', 'Configuración (horarios, etc.)')
    .addTag('admin', 'Administración (config. bases de datos, horarios de atención)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
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
