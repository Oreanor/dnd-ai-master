import { Socket } from 'socket.io';
import { CONFIG, ERROR_MESSAGES } from '../config/constants';

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
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.startCleanup();
  }

  private startCleanup(): void {
    // Очищаем старые записи каждые 5 минут
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [clientId, limit] of clientLimits.entries()) {
      if (now > limit.resetTime) {
        clientLimits.delete(clientId);
      }
    }
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

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    clientLimits.clear();
  }
}

// Предустановленные конфигурации rate limiting с константами
export const rateLimiters = {
  // Лимит для действий игрока
  playerAction: new RateLimiter({
    windowMs: CONFIG.RATE_LIMITS.PLAYER_ACTION.window,
    maxRequests: CONFIG.RATE_LIMITS.PLAYER_ACTION.requests,
    message: ERROR_MESSAGES.RATE_LIMIT.PLAYER_ACTION
  }),

  // Лимит для подключения к комнате
  joinRoom: new RateLimiter({
    windowMs: CONFIG.RATE_LIMITS.ROOM_JOIN.window,
    maxRequests: CONFIG.RATE_LIMITS.ROOM_JOIN.requests,
    message: ERROR_MESSAGES.RATE_LIMIT.ROOM_JOIN
  }),

  // Лимит для AI запросов
  aiRequest: new RateLimiter({
    windowMs: CONFIG.RATE_LIMITS.AI_REQUEST.window,
    maxRequests: CONFIG.RATE_LIMITS.AI_REQUEST.requests,
    message: ERROR_MESSAGES.RATE_LIMIT.AI_REQUEST
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
