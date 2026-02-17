/**
 * Puerto de dominio: abstrae la automatización del portal demandaenlinea.
 * La infraestructura lo implementa (ej. BrowserlessPuppeteerAdapter).
 */
export interface ResultadoRadicacion {
  exito: boolean;
  idExterno?: string;
  mensaje?: string;
  error?: string;
}

export interface DatosRadicacion {
  ciudadCodigo: string;
  departamentoCodigo: string;
  especialidad: string;
  claseProceso: string;
  demandante: Record<string, unknown>;
  demandado: Record<string, unknown>;
  apoderado: Record<string, unknown>;
  rutaArchivoDemanda: string;
}

export interface BrowserAutomationPort {
  radicarDemanda(datos: DatosRadicacion): Promise<ResultadoRadicacion>;
}
