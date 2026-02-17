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
      service: 'bot-demandas-enlinea',
      timestamp: new Date().toISOString(),
    };
  }
}
