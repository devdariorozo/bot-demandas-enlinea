// Responsabilidad: la entidad de dominio, con su identidad y comportamiento.

export class DataBases {
    id: number;
    environment_type_id: number; // FK al environment_type.id
    environment_type_name?: string; // Nombre del tipo de entorno
    portfolio_type_id: number; // FK al portfolio_type.id
    portfolio_type_name?: string; // Nombre del tipo de portfolio
    bases: string[]; // Array bases de datos asociadas (ej: ['ejemplo1', 'ejemplo2'])
    detail: string;
    state_type_id: number;   // FK al state_type.id
    state_type_name?: string; // Nombre del tipo de estado
    /** Solo en respuestas de listado: "portfolio_type_name environment_type_name" o solo portfolio si env es "pro". */
    label_data_base?: string;
    created_at: Date;
    updated_at: Date;
    responsible: string;
}