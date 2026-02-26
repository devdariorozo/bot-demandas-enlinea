// Responsabilidad: la entidad de dominio, con su identidad y comportamiento.

export class AttentionSchedule {
    id: number;
    portfolio_type_id: number; // FK al portfolio_type.id
    portfolio_type_name?: string; // Nombre del tipo de portfolio
    campaing_type_id: number; // FK al campaing_type.id
    campaing_type_name?: string; // Nombre del tipo de campaña
    day_of_week: string; // Dia de la semana en formato ejemplo Lunes, Martes, etc.
    shiftType: string; // Tipo de jornada laboral continua, partida, etc.
    start_time: string; // Hora de inicio en formato ejemplo 08:00
    end_time: string; // Hora de fin en formato ejemplo 17:00
    detail: string;
    state_type_id: number;   // FK al state_type.id
    state_type_name?: string; // Nombre del tipo de estado
    created_at: Date;
    updated_at: Date;
    responsible: string;
}

