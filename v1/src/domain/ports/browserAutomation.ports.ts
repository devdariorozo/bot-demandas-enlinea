import { ManagementDemandsOnline } from '@domain/entities/managementDemandsOnline.entities';

export const BROWSER_AUTOMATION_PORT = Symbol('BROWSER_AUTOMATION_PORT');

export interface LugarEnvioYProcesoInput {
  demanda: ManagementDemandsOnline;
  departamento: string;
  ciudad: string;
  /** Lista de especialidades a intentar en orden de prioridad. */
  especialidades: string[];
  /** Lista de clases de proceso a intentar en orden de prioridad. */
  clasesProceso: string[];
  /** Datos del demandante (tomados de company_type). */
  demandante?: {
    nit: string;
    company_name: string;
    address: string;
    contact_number: string;
    email_notifications: string;
  };
  /** Datos del demandado (tomados de clients, type_identifications, phones, lawsuit_court_assignments). */
  demandado?: {
    /** type_identifications.name ya normalizado a texto humano (ej. "Cédula de Ciudadanía"). */
    document_type_name: string;
    /** Número de identificación del demandado (clients.identification). */
    identification: string;
    /** Nombre completo tal como viene en completed_name. */
    completed_name: string;
    /** Dirección del demandado en mayúsculas (lawsuit_court_assignments.client_address). */
    address: string;
    /** Teléfono principal del demandado (phones.telephone). */
    phone: string;
  };
}

export interface BrowserAutomationPort {
  procesarLugarEnvioYEspecialidadYClase(input: LugarEnvioYProcesoInput): Promise<void>;
}
