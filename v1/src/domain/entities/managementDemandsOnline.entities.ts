// Responsabilidad: la entidad de dominio para gestión de demandas pendientes.

export class ManagementDemandsOnline {
  id: number;
  name_data_base: string;
  portfolio_city_config_id: number;
  campaign_id: number;
  lawsuit_id: number;
  lawsuit_court_assignments_id: number;
  client_id: number;
  path_law_doc: string;
  lawsuit_status: string;
  amount_type_id: number;
  user_id: number;
  user_name: string;
  detail: string;
  state_type_id: number;
  state_type_name?: string;
  created_at: Date;
  updated_at: Date;
  responsible: string;
}
