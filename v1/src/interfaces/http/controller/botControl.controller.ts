// Responsabilidad: endpoints HTTP para controlar el bot (start/stop/status).

import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BotControlService, BotStatus } from '@application/services/botControl.service';
import { dataOne } from '@application/utils/response.utils';

@ApiTags('botControl')
@Controller('bot_control')
export class BotControlController {
  constructor(private readonly botControlService: BotControlService) {}

  @Post('start')
  @ApiOperation({ summary: 'Iniciar el bot de demandas en línea' })
  async start() {
    const status: BotStatus = await this.botControlService.start();
    return dataOne(status);
  }

  @Post('stop')
  @ApiOperation({ summary: 'Detener el bot de demandas en línea' })
  async stop() {
    const status: BotStatus = await this.botControlService.stop();
    return dataOne(status);
  }

  @Get('status')
  @ApiOperation({ summary: 'Consultar el estado actual del bot' })
  async status() {
    const status: BotStatus = await this.botControlService.status();
    return dataOne(status);
  }
}


