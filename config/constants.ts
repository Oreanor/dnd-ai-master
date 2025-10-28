// Application configuration constants
export const CONFIG = {
  // Logging
  MAX_LOGS: parseInt(process.env.MAX_LOGS || '1000'),
  LOG_RETENTION_DAYS: parseInt(process.env.LOG_RETENTION_DAYS || '7'),
  
  // AI Configuration
  MAX_TOKENS: parseInt(process.env.MAX_TOKENS || '200'),
  AI_TEMPERATURE: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  AI_MAX_RESPONSE_LENGTH: parseInt(process.env.AI_MAX_RESPONSE_LENGTH || '500'),
  
  // Rate Limiting
  RATE_LIMITS: {
    PLAYER_ACTION: {
      requests: parseInt(process.env.RATE_LIMIT_PLAYER_ACTION_REQUESTS || '5'),
      window: parseInt(process.env.RATE_LIMIT_PLAYER_ACTION_WINDOW || '15000'), // 15 seconds
    },
    ROOM_JOIN: {
      requests: parseInt(process.env.RATE_LIMIT_ROOM_JOIN_REQUESTS || '3'),
      window: parseInt(process.env.RATE_LIMIT_ROOM_JOIN_WINDOW || '60000'), // 1 minute
    },
    AI_REQUEST: {
      requests: parseInt(process.env.RATE_LIMIT_AI_REQUEST_REQUESTS || '10'),
      window: parseInt(process.env.RATE_LIMIT_AI_REQUEST_WINDOW || '60000'), // 1 minute
    },
  },
  
  // Game Configuration
  MAX_RECENT_EVENTS: parseInt(process.env.MAX_RECENT_EVENTS || '5'),
  MAX_PLAYER_ACTION_LENGTH: parseInt(process.env.MAX_PLAYER_ACTION_LENGTH || '500'),
  MAX_PLAYER_NAME_LENGTH: parseInt(process.env.MAX_PLAYER_NAME_LENGTH || '50'),
  
  // Socket Configuration
  SOCKET_TIMEOUT: parseInt(process.env.SOCKET_TIMEOUT || '30000'), // 30 seconds
  ERROR_AUTO_HIDE_DELAY: parseInt(process.env.ERROR_AUTO_HIDE_DELAY || '5000'), // 5 seconds
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  PLAYER_ID: /^[a-zA-Z0-9@._-]+$/,
  ROOM_ID: /^[a-zA-Z0-9_-]+$/,
  DANGEROUS_PATTERNS: [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /function\s*\(/i,
    /document\./i,
    /window\./i,
  ],
} as const;

// Error messages
export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED: 'Поле обязательно для заполнения',
    TOO_SHORT: 'Слишком короткое значение',
    TOO_LONG: 'Слишком длинное значение',
    INVALID_FORMAT: 'Неверный формат',
    DANGEROUS_CONTENT: 'Содержит недопустимое содержимое',
  },
  RATE_LIMIT: {
    PLAYER_ACTION: 'Слишком много действий. Попробуйте позже.',
    ROOM_JOIN: 'Слишком много попыток подключения. Попробуйте позже.',
    AI_REQUEST: 'Слишком много запросов к AI. Попробуйте позже.',
  },
  SOCKET: {
    CONNECTION_FAILED: 'Не удалось подключиться к серверу',
    ROOM_JOIN_FAILED: 'Не удалось присоединиться к комнате',
    ACTION_FAILED: 'Не удалось выполнить действие',
  },
  AI: {
    UNAVAILABLE: 'AI временно недоступен',
    RATE_LIMITED: 'Превышен лимит запросов к AI',
    ERROR: 'Ошибка при обращении к AI',
  },
} as const;
