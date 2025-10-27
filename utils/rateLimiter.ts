import { Socket } from 'socket.io';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

interface ClientRateLimit {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (в продакшене лучше использовать Redis)
const clientLimits = new Map<string, ClientRateLimit>();

export class RateLimiter {
  public config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(clientId: string): boolean {
    const now = Date.now();
    const limit = clientLimits.get(clientId);

    if (!limit || now > limit.resetTime) {
      // Создаем новый лимит или сбрасываем существующий
      clientLimits.set(clientId, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }

    if (limit.count >= this.config.maxRequests) {
      return false;
    }

    // Увеличиваем счетчик
    limit.count++;
    return true;
  }

  getRemainingRequests(clientId: string): number {
    const limit = clientLimits.get(clientId);
    if (!limit || Date.now() > limit.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - limit.count);
  }

  getResetTime(clientId: string): number {
    const limit = clientLimits.get(clientId);
    return limit ? limit.resetTime : Date.now() + this.config.windowMs;
  }
}

// Предустановленные конфигурации rate limiting
export const rateLimiters = {
  // Лимит для действий игрока (5 действий за 15 секунд)
  playerAction: new RateLimiter({
    windowMs: 15 * 1000, // 15 секунд
    maxRequests: 5,
    message: 'Слишком много действий. Подождите немного.'
  }),

  // Лимит для подключения к комнате (3 попытки за минуту)
  joinRoom: new RateLimiter({
    windowMs: 60 * 1000, // 1 минута
    maxRequests: 3,
    message: 'Слишком много попыток подключения. Подождите минуту.'
  }),

  // Лимит для AI запросов (10 запросов за минуту)
  aiRequest: new RateLimiter({
    windowMs: 60 * 1000, // 1 минута
    maxRequests: 10,
    message: 'Превышен лимит AI запросов. Подождите минуту.'
  })
};

// Утилита для получения ID клиента из socket
export const getClientId = (socket: Socket): string => {
  // Используем IP адрес как идентификатор клиента
  const ip = socket.handshake.address || socket.conn.remoteAddress || 'unknown';
  return ip;
};

// Утилита для отправки ошибки rate limit
export const sendRateLimitError = (socket: Socket, message: string, resetTime: number) => {
  socket.emit('error', {
    code: 'RATE_LIMIT_EXCEEDED',
    message,
    resetTime
  });
};
