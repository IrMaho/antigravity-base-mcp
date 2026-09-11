import fs from 'fs';
import path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

export class Logger {
  private static level: LogLevel = (process.env.MCP_LOG_LEVEL as LogLevel) || 'info';
  private static logFilePath: string | null = process.env.MCP_LOG_FILE || null;

  public static setLevel(level: LogLevel): void {
    this.level = level;
  }

  public static setLogFile(filePath: string): void {
    this.logFilePath = filePath;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {}
    }
  }

  private static shouldLog(targetLevel: LogLevel): boolean {
    return LOG_LEVELS[targetLevel] >= LOG_LEVELS[this.level];
  }

  private static formatMessage(level: string, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    let ctxStr = '';
    if (context && Object.keys(context).length > 0) {
      try {
        ctxStr = ' ' + JSON.stringify(context);
      } catch {
        ctxStr = ' [Circular/Unserializable Context]';
      }
    }
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctxStr}`;
  }

  private static writeLog(formatted: string): void {
    // ALWAYS write to stderr so stdout remains 100% clean for JSON-RPC
    process.stderr.write(formatted + '\n');

    if (this.logFilePath) {
      try {
        fs.appendFileSync(this.logFilePath, formatted + '\n', 'utf-8');
      } catch {}
    }
  }

  public static debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      this.writeLog(this.formatMessage('debug', message, context));
    }
  }

  public static info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      this.writeLog(this.formatMessage('info', message, context));
    }
  }

  public static warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      this.writeLog(this.formatMessage('warn', message, context));
    }
  }

  public static error(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      this.writeLog(this.formatMessage('error', message, context));
    }
  }
}
