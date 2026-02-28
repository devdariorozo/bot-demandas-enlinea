// Responsabilidad: la entidad de dominio, con su identidad y comportamiento.

export class PortfolioCityConfig {
  id: number;
  id_data_bases: number; // FK a data_bases.id
  id_city_views: number;
  name_departament: string;
  name_city: string;
  city: string;
  detail: string;
  state_type_id: number; // FK a state_type.id
  state_type_name?: string;
  created_at: Date;
  updated_at: Date;
  responsible: string;
}
