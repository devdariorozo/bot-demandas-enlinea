import { ManagementDemandsOnline } from '@domain/entities/managementDemandsOnline.entities';

export const BROWSER_AUTOMATION_PORT = Symbol('BROWSER_AUTOMATION_PORT');

export interface LugarEnvioYProcesoInput {
  demanda: ManagementDemandsOnline;
  departamento: string;
  ciudad: string;
  especialidad: string;
  claseProceso: string;
}

export interface BrowserAutomationPort {
  procesarLugarEnvioYEspecialidadYClase(input: LugarEnvioYProcesoInput): Promise<void>;
}

