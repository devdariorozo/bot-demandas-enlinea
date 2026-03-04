// Responsabilidad: logger de aplicación estructurado (JSON) a consola y archivo.
// Archivo diario: YYYY-MM-DD-logs-{nombreSistema}.log. Limpieza de archivos según LOG_RETENTION_DAYS.

import { Injectable, LoggerService, LogLevel, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

interface LogPayload {
  level: LogLevel;
  context?: string;
  message: string;
  status?: 'OK' | 'WARN' | 'ERROR';
  type?: string;
  meta?: Record<string, unknown>;
  stack?: string;
}

const DEFAULT_SYSTEM_NAME = 'bot-demands-online';
const DEFAULT_RETENTION_DAYS = 30;
const LOG_FILE_PATTERN = /^(\d{4}-\d{2}-\d{2})-logs-.+\.log$/;

@Injectable()
export class AppLogger implements LoggerService, OnModuleInit, OnModuleDestroy {
  private readonly logLevels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];
  private readonly logsDir: string;
  private readonly systemName: string;
  private readonly retentionDays: number;
  private cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly configService: ConfigService) {
    this.logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    this.systemName = this.configService.get<string>('PROJECT_NAME', DEFAULT_SYSTEM_NAME) || DEFAULT_SYSTEM_NAME;
    const days = this.configService.get<number>('LOG_RETENTION_DAYS', DEFAULT_RETENTION_DAYS);
    this.retentionDays = Number.isFinite(days) && days >= 1 ? Math.floor(Number(days)) : DEFAULT_RETENTION_DAYS;
  }

  onModuleInit(): void {
    this.runLogsCleanup();
    // Ejecutar limpieza cada 24 horas
    this.cleanupIntervalId = setInterval(() => this.runLogsCleanup(), 24 * 60 * 60 * 1000);
  }

  onModuleDestroy(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
  }

  /** Ruta del archivo de log del día en curso: YYYY-MM-DD-logs-{nombreSistema}.log */
  private getLogFilePath(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    return path.join(this.logsDir, `${dateStr}-logs-${this.systemName}.log`);
  }

  /** Elimina archivos de log más antiguos que LOG_RETENTION_DAYS. */
  private runLogsCleanup(): void {
    try {
      const files = fs.readdirSync(this.logsDir);
      const now = new Date();
      const cutoffTime = now.getTime() - this.retentionDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const match = file.match(LOG_FILE_PATTERN);
        if (!match) continue;
        const [y, m, d] = match[1].split('-').map(Number);
        const fileDate = new Date(y, m - 1, d);
        if (!Number.isNaN(fileDate.getTime()) && fileDate.getTime() < cutoffTime) {
          const filePath = path.join(this.logsDir, file);
          fs.unlinkSync(filePath);
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error cleaning old log files', err);
    }
  }

  log(message: string, context?: string) {
    this.write({
      level: 'log',
      context,
      message,
      status: 'OK',
    });
  }

  error(message: string, trace?: string, context?: string) {
    this.write({
      level: 'error',
      context,
      message,
      status: 'ERROR',
      stack: trace,
    });
  }

  warn(message: string, context?: string) {
    this.write({
      level: 'warn',
      context,
      message,
      status: 'WARN',
    });
  }

  debug(message: string, context?: string) {
    this.write({
      level: 'debug',
      context,
      message,
      status: 'OK',
    });
  }

  verbose(message: string, context?: string) {
    this.write({
      level: 'verbose',
      context,
      message,
      status: 'OK',
    });
  }

  /** Permite logs enriquecidos desde servicios: type, meta, status custom. */
  structured(payload: Omit<LogPayload, 'level'> & { level?: LogLevel }) {
    const level = payload.level ?? 'log';
    this.write({ ...payload, level });
  }

  private write(payload: LogPayload) {
    if (!this.logLevels.includes(payload.level)) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level: payload.level,
      status: payload.status,
      type: payload.type,
      context: payload.context,
      message: payload.message,
      meta: payload.meta,
      stack: payload.stack,
    };

    const line = JSON.stringify(entry);

    // Consola
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(line);
    }

    // Archivo diario
    const logFilePath = this.getLogFilePath();
    fs.appendFile(logFilePath, line + '\n', (err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('Error writing log file', err);
      }
    });
  }
}

