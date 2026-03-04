// Responsabilidad: módulo Nest para control del bot (start/stop/status).

import { Module } from '@nestjs/common';

import { BotControlController } from '../http/controller/botControl.controller';
import { BotControlService } from '@application/services/botControl.service';
import { DataBasesModule } from './dataBases.module';
import { AttentionScheduleModule } from './attentionSchedule.module';

@Module({
  controllers: [BotControlController],
  imports: [DataBasesModule, AttentionScheduleModule],
  providers: [BotControlService],
  exports: [BotControlService],
})
export class BotControlModule {}

