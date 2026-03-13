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
  /** Apoderado (lawyer_data por portfolio_type_id de la demanda). Solo fase 3. */
  apoderado?: {
    document_name: string;
    document_number: string;
    first_name: string;
    second_name: string;
    first_last_name: string;
    second_last_name: string;
    address: string;
    contact_number: string;
    email_notifications: string;
  };
}

/** Resultado del flujo en el portal (para mensaje final en DB y logs). */
export interface ProcesarLugarEnvioResult {
  /** true si se llegó a la sección Archivos adjuntos y tipo DEMANDA quedó seleccionado. */
  reachedArchivosAdjuntos: boolean;
  /** true si se generó path_law_doc, se descargó el PDF y se subió al input file del portal. */
  pdfDemandaAdjuntado?: boolean;
}

export interface BrowserAutomationPort {
  procesarLugarEnvioYEspecialidadYClase(
    input: LugarEnvioYProcesoInput,
  ): Promise<ProcesarLugarEnvioResult>;
}
