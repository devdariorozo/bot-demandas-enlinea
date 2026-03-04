// Responsabilidad: contratos del dominio para management_demands_online.

import { ManagementDemandsOnline } from '@domain/entities/managementDemandsOnline.entities';

/** Token para inyección del repositorio (las interfaces no existen en runtime en NestJS). */
export const MANAGEMENT_DEMANDS_ONLINE_REPOSITORY = Symbol('MANAGEMENT_DEMANDS_ONLINE_REPOSITORY');

/** Datos mínimos para crear un registro (id y fechas son opcionales). */
export type CreateManagementDemandsOnlineInput = Pick<
  ManagementDemandsOnline,
  | 'name_data_base'
  | 'portfolio_city_config_id'
  | 'campaign_id'
  | 'lawsuit_id'
  | 'lawsuit_court_assignments_id'
  | 'client_id'
  | 'path_law_doc'
  | 'lawsuit_status'
  | 'amount_type_id'
  | 'state_type_id'
> &
  Partial<Pick<ManagementDemandsOnline, 'user_id' | 'user_name' | 'detail' | 'responsible'>> &
  Partial<ManagementDemandsOnline>;

export interface ManagementDemandsOnlineRepository {
  create(input: CreateManagementDemandsOnlineInput): Promise<ManagementDemandsOnline>;
  findAll(): Promise<ManagementDemandsOnline[]>;
  findById(id: number): Promise<ManagementDemandsOnline>;
  /** Para evitar duplicados al sincronizar por job. */
  findByLawsuitCourtAssignmentsIdAndBase(
    lawsuit_court_assignments_id: number,
    name_data_base: string,
  ): Promise<ManagementDemandsOnline | null>;
  update(record: ManagementDemandsOnline): Promise<ManagementDemandsOnline>;
  delete(id: number): Promise<void>;
}
