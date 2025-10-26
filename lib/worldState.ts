interface Player {
  id: string;
  name: string;
  str: number;
}

interface LogEntry {
  player: string;
  action: string;
  roll: number;
  success: boolean;
}

interface GameContext {
  currentScene: string;
  lastAIResponse: string;
  recentEvents: LogEntry[];
  currentLocation: string;
}

export const worldState = {
    locations: {
      forge: {
        name: "Заброшенная кузница",
        desc: "Сумрак, запах ржавчины и углей.",
        connections: ["yard"],
        npcs: [{ id: "guard1", name: "Страж кузни", hp: 12, hostile: true }],
        items: [{ id: "key1", name: "Старый ключ", pickup: true }]
      },
      yard: { name: "Двор кузни", desc: "Разбитая телега", connections: ["forge"], npcs: [], items: [] }
    },
    players: {} as Record<string, Player>,
    log: [] as LogEntry[],
    context: {
      currentScene: "Вы находитесь в заброшенной кузнице. В углу стоит страж, который смотрит на вас с подозрением.",
      lastAIResponse: "",
      recentEvents: [] as LogEntry[],
      currentLocation: "forge"
    } as GameContext,
    isLocationGenerated: false // Флаг для отслеживания генерации локации
  };
  