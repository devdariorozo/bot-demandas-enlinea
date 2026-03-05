import { Module } from '@nestjs/common';

import { DemandsOnlineAutomationService } from '@application/services/demandsOnlineAutomation.service';
import { ManagementDemandsOnlineModule } from './managementDemandsOnline.module';
import { PortfolioCityConfigModule } from './portfolioCityConfig.module';
import { AmountTypeModule } from './amountType.module';
import { BotControlModule } from './botControl.module';
import { DataBasesModule } from './dataBases.module';
import { LoggerModule } from '@infrastructure/logging/logger.module';
import { BROWSER_AUTOMATION_PORT } from '@domain/ports/browserAutomation.ports';
import { BrowserlessPuppeteerAdapter } from '@infrastructure/browser/browserlessPuppeteer.adapter';

@Module({
  imports: [
    ManagementDemandsOnlineModule,
    PortfolioCityConfigModule,
    AmountTypeModule,
    BotControlModule,
    DataBasesModule,
    LoggerModule,
  ],
  providers: [
    DemandsOnlineAutomationService,
    {
      provide: BROWSER_AUTOMATION_PORT,
      useClass: BrowserlessPuppeteerAdapter,
    },
  ],
  exports: [DemandsOnlineAutomationService],
})
export class DemandsOnlineAutomationModule {}

