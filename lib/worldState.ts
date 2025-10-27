import { Player, LogEntry, GameContext, WorldState, NPC, Item } from '../types';

export const worldState: WorldState = {
    locations: {
      forge: {
        name: "Заброшенная кузница",
        desc: "Сумрак, запах ржавчины и углей.",
        connections: ["yard"],
        npcs: [{ id: "guard1", name: "Страж кузни", hp: 12, hostile: true }] as NPC[],
        items: [{ id: "key1", name: "Старый ключ", type: "misc" }] as Item[]
      },
      yard: { name: "Двор кузни", desc: "Разбитая телега", connections: ["forge"], npcs: [] as NPC[], items: [] as Item[] }
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
  