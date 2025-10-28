import { CONFIG } from '../config/constants';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  clientId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly maxLogs = CONFIG.MAX_LOGS;
  private readonly retentionDays = CONFIG.LOG_RETENTION_DAYS;

  constructor() {
    this.startCleanupInterval();
  }

  private startCleanupInterval(): void {
    // Cleanup logs every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldLogs();
    }, 60 * 60 * 1000);
  }

  private cleanupOldLogs(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
    
    this.logs = this.logs.filter(log => log.timestamp > cutoffDate);
    
    // Also limit by count
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private addLog(level: LogLevel, message: string, data?: any, clientId?: string): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      clientId
    };

    this.logs.push(entry);
    
    // Immediate cleanup if we exceed max logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Only log to console in development or for errors
    if (CONFIG.NODE_ENV === 'development' || level === LogLevel.ERROR) {
      const timestamp = entry.timestamp.toISOString();
      const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
      
      switch (level) {
        case LogLevel.ERROR:
          console.error(logMessage, data || '');
          break;
        case LogLevel.WARN:
          console.warn(logMessage, data || '');
          break;
        case LogLevel.INFO:
          console.info(logMessage, data || '');
          break;
        case LogLevel.DEBUG:
          console.debug(logMessage, data || '');
          break;
      }
    }
  }

  error(message: string, data?: any, clientId?: string): void {
    this.addLog(LogLevel.ERROR, message, data, clientId);
  }

  warn(message: string, data?: any, clientId?: string): void {
    this.addLog(LogLevel.WARN, message, data, clientId);
  }

  info(message: string, data?: any, clientId?: string): void {
    this.addLog(LogLevel.INFO, message, data, clientId);
  }

  debug(message: string, data?: any, clientId?: string): void {
    this.addLog(LogLevel.DEBUG, message, data, clientId);
  }

  // Cleanup method for graceful shutdown
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.logs = [];
  }

  // Get logs for debugging (only in development)
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    if (CONFIG.NODE_ENV !== 'development') {
      return [];
    }
    
    let filteredLogs = this.logs;
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }
    
    return filteredLogs;
  }
}

// Создаем глобальный экземпляр логгера
export const logger = new Logger();

// Утилиты для логирования игровых событий
export const gameLogger = {
  playerJoin: (playerName: string, clientId: string) => {
    logger.info(`Player joined: ${playerName}`, { playerName }, clientId);
  },

  playerLeave: (playerName: string, clientId: string) => {
    logger.info(`Player left: ${playerName}`, { playerName }, clientId);
  },

  playerAction: (playerName: string, action: string, clientId: string) => {
    logger.info(`Player action: ${playerName} - ${action}`, { playerName, action }, clientId);
  },

  aiResponse: (responseLength: number, clientId: string) => {
    logger.debug(`AI response generated`, { responseLength }, clientId);
  },

  rateLimitHit: (clientId: string, limitType: string) => {
    logger.warn(`Rate limit exceeded: ${limitType}`, { limitType }, clientId);
  },

  validationError: (error: string, clientId: string) => {
    logger.warn(`Validation error: ${error}`, { error }, clientId);
  },

  socketError: (error: string, clientId: string) => {
    logger.error(`Socket error: ${error}`, { error }, clientId);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  logger.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.destroy();
  process.exit(0);
});