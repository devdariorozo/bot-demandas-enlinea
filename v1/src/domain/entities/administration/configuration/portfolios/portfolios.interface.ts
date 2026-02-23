//===============================================================
// Interfaz de configuración de carteras
//===============================================================

export interface ConfigPortfolios {
  id: number;
  portfolio_type: string;
  detail: string | null;
  state_type: number;
  created_at: Date;
  updated_at: Date;
  responsible: string | null;
}