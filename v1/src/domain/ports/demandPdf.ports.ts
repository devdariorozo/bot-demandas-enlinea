export const DEMAND_PDF_PORT = Symbol('DEMAND_PDF_PORT');

export interface DemandPdfPort {
  /**
   * POST {base}/generateDemandOnlinePdf con client_id y campaign_id.
   * Devuelve path_demanda_pdf (clave/ruta para descargar en S3).
   */
  generateDemandOnlinePdf(clientId: number, campaignId: number): Promise<string>;

  /**
   * GET {DOWNLOAD_PDF_DEMAND_SERVICE}/local/download/{encodeURIComponent(path_law_doc)}.
   * Token en cabecera X-API-Key. pathDemandaPdf = path_law_doc devuelto por generate.
   */
  downloadDemandPdfToFile(pathDemandaPdf: string, absoluteFilePath: string): Promise<void>;
}
