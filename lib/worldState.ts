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
    log: [] as LogEntry[]
  };
  