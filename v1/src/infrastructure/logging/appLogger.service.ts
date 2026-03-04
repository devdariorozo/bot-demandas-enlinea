// Responsabilidad: logger de aplicación estructurado (JSON) a consola y archivo.

import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
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

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logLevels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];
  private readonly logFilePath: string;

  constructor() {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    this.logFilePath = path.join(logsDir, 'app.log');
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

    // Archivo
    fs.appendFile(this.logFilePath, line + '\n', (err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('Error writing log file', err);
      }
    });
  }
}

