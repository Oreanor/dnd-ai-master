import { Socket } from 'socket.io';
import { Player, WorldState } from './game';

export interface SocketEvents {
  // Client to Server events
  join_room: { roomId: string; player: Player };
  player_action: { roomId: string; playerId: string; action: string };
  
  // Server to Client events
  system: { msg: string };
  player_message: { playerName: string; action: string };
  game_update: { aiResponse: string; worldState: WorldState };
  error: { code: string; message: string };
}

export interface SocketClientEvents extends SocketEvents {
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;
}

export interface SocketServerEvents extends SocketEvents {
  connection: (socket: Socket) => void;
  disconnect: (reason: string) => void;
}

