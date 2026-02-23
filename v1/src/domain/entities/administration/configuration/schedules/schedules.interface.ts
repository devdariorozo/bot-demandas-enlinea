//===============================================================
// Interfaz de configuración de horarios
//===============================================================

export interface ConfigSchedules {
  id: number;
  environment: string;
  portfolio_type: string;
  campaign: string | null;
  data_bases: string[];
  detail: string | null;
  state_type: number;
  created_at: Date;
  updated_at: Date;
}