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
}

export interface BrowserAutomationPort {
  procesarLugarEnvioYEspecialidadYClase(input: LugarEnvioYProcesoInput): Promise<void>;
}
