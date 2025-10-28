// Простая валидация без внешних зависимостей
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validators = {
  // Валидация строки
  string: (value: unknown, field: string, minLength = 1, maxLength = 1000): string => {
    if (typeof value !== 'string') {
      throw new ValidationError(`${field} должно быть строкой`, field);
    }
    if (value.length < minLength) {
      throw new ValidationError(`${field} слишком короткое (минимум ${minLength} символов)`, field);
    }
    if (value.length > maxLength) {
      throw new ValidationError(`${field} слишком длинное (максимум ${maxLength} символов)`, field);
    }
    return value.trim();
  },

  // Валидация ID игрока
  playerId: (value: unknown, field = 'playerId'): string => {
    const id = validators.string(value, field, 1, 50);
    if (!/^[a-zA-Z0-9@._-]+$/.test(id)) {
      throw new ValidationError(`${field} содержит недопустимые символы`, field);
    }
    return id;
  },

  // Валидация ID комнаты
  roomId: (value: unknown, field = 'roomId'): string => {
    const id = validators.string(value, field, 1, 50);
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      throw new ValidationError(`${field} содержит недопустимые символы`, field);
    }
    return id;
  },

  // Валидация действия игрока
  playerAction: (value: unknown, field = 'action'): string => {
    const action = validators.string(value, field, 1, 500);
    
    // Проверяем на потенциально опасные команды
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /function\s*\(/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(action)) {
        throw new ValidationError(`${field} содержит недопустимое содержимое`, field);
      }
    }
    
    return action;
  },

  // Валидация объекта игрока
  player: (value: unknown, field = 'player'): any => {
    if (typeof value !== 'object' || value === null) {
      throw new ValidationError(`${field} должно быть объектом`, field);
    }
    
    const player = value as any;
    
    // Проверяем обязательные поля
    if (!player.id || !player.name) {
      throw new ValidationError(`${field} должно содержать id и name`, field);
    }
    
    // Валидируем поля
    validators.playerId(player.id, `${field}.id`);
    validators.string(player.name, `${field}.name`, 1, 50);
    
    // Валидируем числовые поля
    if (typeof player.str !== 'number' || player.str < 1 || player.str > 20) {
      throw new ValidationError(`${field}.str должно быть числом от 1 до 20`, field);
    }
    
    if (typeof player.dex !== 'number' || player.dex < 1 || player.dex > 20) {
      throw new ValidationError(`${field}.dex должно быть числом от 1 до 20`, field);
    }
    
    if (typeof player.hp !== 'number' || player.hp < 1 || player.hp > 100) {
      throw new ValidationError(`${field}.hp должно быть числом от 1 до 100`, field);
    }
    
    return player;
  }
};

