import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

import { DemandPdfPort } from '@domain/ports/demandPdf.ports';
import { AppLogger } from '@infrastructure/logging/appLogger.service';

@Injectable()
export class DemandPdfHttpAdapter implements DemandPdfPort {
  constructor(
    private readonly configService: ConfigService,
    private readonly appLogger: AppLogger,
  ) {}

  async generateDemandOnlinePdf(clientId: number, campaignId: number): Promise<string> {
    const base = this.configService.get<string>('GENERATE_PDF_DEMAND_SERVICE')?.replace(/\/$/, '') ?? '';
    const apiKey = this.configService.get<string>('GENERATE_PDF_DEMAND_SERVICE_API_KEY') ?? '';
    if (!base) {
      throw new Error('GENERATE_PDF_DEMAND_SERVICE no configurado');
    }
    const url = `${base}/external/lawsuits/generatedemandonlinepdf`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
      body: JSON.stringify({ client_id: clientId, campaign_id: campaignId }),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(
        `generateDemandOnlinePdf HTTP ${res.status}: ${text.slice(0, 500)}`,
      );
    }
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error('generateDemandOnlinePdf: respuesta no es JSON');
    }
    const data = (json.data ?? json) as Record<string, unknown>;
    const path =
      (json.path_demanda_pdf as string) ||
      (json.pathDemandaPdf as string) ||
      (json.path_law_doc as string) ||
      (json.pathLawDoc as string) ||
      (data.path_demanda_pdf as string) ||
      (data.pathDemandaPdf as string) ||
      (data.path_law_doc as string) ||
      (data.pathLawDoc as string);
    if (typeof path !== 'string' || !path.trim()) {
      throw new Error('generateDemandOnlinePdf: falta path_demanda_pdf en la respuesta');
    }
    return path.trim();
  }

  /**
   * GET {base}/local/download/{file_path}
   * file_path = path_law_doc (ruta relativa en storage, ej. cartera_propia_QA/demandas_/demanda_31....pdf).
   * En URL el path completo va codificado (slashes → %2F), como en la doc del servicio.
   * Auth: X-API-Key (Swagger APIKeyHeader).
   */
  async downloadDemandPdfToFile(pathDemandaPdf: string, absoluteFilePath: string): Promise<void> {
    const base = this.configService.get<string>('DOWNLOAD_PDF_DEMAND_SERVICE')?.replace(/\/$/, '') ?? '';
    const apiKey = this.configService.get<string>('DOWNLOAD_PDF_DEMAND_SERVICE_API_KEY') ?? '';
    if (!base) {
      throw new Error('DOWNLOAD_PDF_DEMAND_SERVICE no configurado');
    }
    const filePath = pathDemandaPdf.trim();
    if (!filePath) {
      throw new Error('downloadDemandPdf: file_path (path_law_doc) vacío');
    }
    const segment = encodeURIComponent(filePath);
    const url = `${base}/local/download/${segment}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
        Accept: 'application/pdf, */*',
      },
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`downloadDemandPdf HTTP ${res.status}: ${errText.slice(0, 300)}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 64) {
      throw new Error('downloadDemandPdf: archivo demasiado pequeño o vacío');
    }
    await fs.promises.writeFile(absoluteFilePath, buf);
    this.appLogger.structured({
      level: 'debug',
      context: DemandPdfHttpAdapter.name,
      type: 'DEMAND_PDF',
      status: 'OK',
      message: 'PDF demanda descargado a temporal',
      meta: {
        bytes: buf.length,
        file: absoluteFilePath,
        downloadUrlSuffix: `/local/download/${segment.slice(0, 80)}${segment.length > 80 ? '…' : ''}`,
      },
    });
  }
}
