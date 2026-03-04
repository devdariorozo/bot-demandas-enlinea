// Responsabilidad: la entidad de dominio para tipos de cuantía.

export class AmountType {
  id: number;
  type: string;
  specialty_process: string;
  class_process: string;
  detail: string;
  state_type_id: number; // FK a state_type.id
  state_type_name?: string; // Nombre del tipo de estado
  created_at: Date;
  updated_at: Date;
  responsible: string;
}

