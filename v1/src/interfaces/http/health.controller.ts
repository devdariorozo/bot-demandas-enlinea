import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Verificación de que el servicio está vivo' })
  check() {
    return {
      status: 'ok',
      service: process.env.NOMBRE_SERVICIO_SWAGGER,
      timestamp: new Date().toISOString(),
    };
  }
}
