//===============================================================
// Port para la persistencia de la configuración de horarios
//===============================================================

import { ConfigSchedules } from '../../../../entities/administration/configuration/schedules/schedules.interface';

export interface ConfigSchedulesRepositoryPort {
  create(entity: Partial<ConfigSchedules>): Promise<ConfigSchedules>;
  findByNaturalKey(
    environment: string,
    portfolio_type: string,
    campaign?: string | null,
  ): Promise<ConfigSchedules | null>;
}