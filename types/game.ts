export interface Player {
  id: string;
  name: string;
  str: number;
  dex: number;
  hp: number;
  inventory: Item[];
  socketId?: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  type: 'weapon' | 'armor' | 'consumable' | 'misc';
}

export interface NPC {
  id: string;
  name: string;
  hp: number;
  hostile: boolean;
}

export interface Location {
  name: string;
  desc: string;
  connections: string[];
  npcs: NPC[];
  items: Item[];
}

export interface LogEntry {
  player: string;
  action: string;
  roll: number;
  success: boolean;
}

export interface GameContext {
  currentScene: string;
  lastAIResponse: string;
  recentEvents: LogEntry[];
  currentLocation: string;
}

export interface WorldState {
  locations: Record<string, Location>;
  players: Record<string, Player>;
  log: LogEntry[];
  context: GameContext;
  isLocationGenerated: boolean;
}

export interface Message {
  type: 'system' | 'ai' | 'player';
  text: string;
  playerName?: string;
}

export interface GameRoomProps {
  roomId: string;
  player: Player;
}

export interface ActionFormProps {
  onSubmit: (text: string) => void;
}
