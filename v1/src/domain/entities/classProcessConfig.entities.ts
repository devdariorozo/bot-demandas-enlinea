// Responsabilidad: la entidad de dominio, con su identidad y comportamiento.

export class ClassProcessConfig {
    id: number;
    portfolio_type_id: number; // FK al portfolio_type.id
    portfolio_type_name?: string; // Nombre del tipo de portfolio
    campaing_type_id: number; // FK al campaing_type.id
    campaing_type_name?: string; // Nombre del tipo de campaña
    class_process_ids: number[]; // Array de FK a class_process.id
    class_process_names?: string[]; // Array de nombres de clase de proceso, mismo orden que los ids
    detail: string;
    state_type_id: number;   // FK al state_type.id
    state_type_name?: string; // Nombre del tipo de estado
    created_at: Date;
    updated_at: Date;
    responsible: string;
}