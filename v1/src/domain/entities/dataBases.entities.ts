// Responsabilidad: la entidad de dominio, con su identidad y comportamiento.

export class DataBases {
    id: number;
    environment_type_id: number; // FK al environment_type.id
    environment_type_name?: string; // Nombre del tipo de entorno
    portfolio_type_id: number; // FK al portfolio_type.id
    portfolio_type_name?: string; // Nombre del tipo de portfolio
    campaing_type_id: number; // FK al campaing_type.id
    campaing_type_name?: string; // Nombre del tipo de campaña
    bases: string[]; // Array bases de datos asociadas a la campaña (ej: ['ejemplo1', 'ejemplo2'])
    detail: string;
    state_type_id: number;   // FK al state_type.id
    state_type_name?: string; // Nombre del tipo de estado
    created_at: Date;
    updated_at: Date;
    responsible: string;
}