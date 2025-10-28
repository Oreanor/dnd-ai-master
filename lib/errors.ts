// Custom error classes for better error handling
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, public resetTime?: number) {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

export class SocketError extends AppError {
  constructor(message: string, public clientId?: string) {
    super(message, 'SOCKET_ERROR', 500);
    this.name = 'SocketError';
  }
}

export class AIError extends AppError {
  constructor(message: string, public originalError?: Error) {
    super(message, 'AI_ERROR', 503);
    this.name = 'AIError';
  }
}

export class GameError extends AppError {
  constructor(message: string, public gameState?: any) {
    super(message, 'GAME_ERROR', 400);
    this.name = 'GameError';
  }
}

// Error handler utility
export class ErrorHandler {
  static handle(error: unknown, context?: string): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(
        error.message,
        'UNKNOWN_ERROR',
        500,
        false
      );
    }

    return new AppError(
      'An unknown error occurred',
      'UNKNOWN_ERROR',
      500,
      false
    );
  }

  static isOperational(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }

  static logError(error: AppError, context?: string): void {
    const logData = {
      name: error.name,
      code: error.code,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      context,
      stack: error.stack,
    };

    if (error.statusCode >= 500) {
      console.error(`[ERROR] ${error.message}`, logData);
    } else {
      console.warn(`[WARN] ${error.message}`, logData);
    }
  }
}
