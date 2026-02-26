// Responsabilidad: la entidad de dominio, con su identidad y comportamiento.

export class ClassProcess {
    id: number;
    specialty_process_id: number; // FK al specialty_process.id
    specialty_process_name?: string; // Nombre de la especialidad de proceso
    type: string;
    detail: string;
    state_type_id: number;   // FK al state_type.id
    state_type_name?: string; // Nombre del tipo de estado
    created_at: Date;
    updated_at: Date;
    responsible: string;
}