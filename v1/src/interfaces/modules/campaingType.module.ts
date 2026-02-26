// Responsabilidad: módulo Nest para CampaingType.

import { Module } from '@nestjs/common';
import { CampaingTypeController } from '../http/controller/campaingType.controller';
import { CampaingTypeService } from '@application/services/campaingType.service';
import { CampaingTypeRepositoryImpl } from '@infrastructure/persistence/repositories/campaingType.repositories';
import { CAMPaING_TYPE_REPOSITORY } from '@domain/ports/campaingType.ports';
import { StateTypeModule } from './stateType.module';
import { StateTypeService } from '@application/services/stateType.service';
import { STATE_TYPE_REPOSITORY } from '@domain/ports/stateType.ports';
import { StateTypeRepositoryImpl } from '@infrastructure/persistence/repositories/stateType.repositories';

@Module({
    controllers: [CampaingTypeController],
    providers: [
        CampaingTypeService,
        StateTypeService,
        {
            provide: CAMPaING_TYPE_REPOSITORY,
            useClass: CampaingTypeRepositoryImpl,
        },
        {
            provide: STATE_TYPE_REPOSITORY,
            useClass: StateTypeRepositoryImpl,
        },
    ],
    exports: [
        CampaingTypeService,
        { provide: CAMPaING_TYPE_REPOSITORY, useClass: CampaingTypeRepositoryImpl },
        { provide: STATE_TYPE_REPOSITORY, useClass: StateTypeRepositoryImpl },
    ],
    imports: [StateTypeModule],
})
export class CampaingTypeModule {}