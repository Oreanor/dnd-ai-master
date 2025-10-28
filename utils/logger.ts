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
  private maxLogs = 1000; // Максимальное количество логов в памяти

  private addLog(level: LogLevel, message: string, data?: any, clientId?: string): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      clientId
    };

    this.logs.push(entry);
    
    // Ограничиваем количество логов в памяти
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Выводим в консоль
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
