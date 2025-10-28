import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Message, Player, WorldState } from "../types";
import { SOCKET_CONFIG, ERROR_AUTO_HIDE_DELAY } from "../constants/socket";

interface UseSocketProps {
  roomId: string;
  player: Player;
}

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  messages: Message[];
  world: WorldState | null;
  players: Player[];
  error: string | null;
  sendAction: (text: string) => void;
}

export function useSocket({ roomId, player }: UseSocketProps): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [world, setWorld] = useState<WorldState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_CONFIG.url, {
      path: SOCKET_CONFIG.path,
      transports: [...SOCKET_CONFIG.options.transports],
      autoConnect: SOCKET_CONFIG.options.autoConnect,
      reconnection: SOCKET_CONFIG.options.reconnection,
      reconnectionAttempts: SOCKET_CONFIG.options.reconnectionAttempts,
      reconnectionDelay: SOCKET_CONFIG.options.reconnectionDelay,
      timeout: SOCKET_CONFIG.options.timeout
    });
    
    socketRef.current = socket;

    // Подключаемся к комнате
    socket.emit("join_room", { roomId, player });

    // Обработчики событий
    socket.on("system", (data: { msg: string }) => {
      setMessages(prev => [...prev, { type: "system", text: data.msg }]);
    });

    socket.on("player_message", ({ playerName, action }: { playerName: string; action: string }) => {
      setMessages(prev => [...prev, { type: "player", text: action, playerName }]);
    });
    
    socket.on("game_update", ({ aiResponse, worldState }: { aiResponse: string; worldState: WorldState }) => {
      // Добавляем ответ DND Master только если он не пустой
      if (aiResponse && aiResponse.trim()) {
        setMessages(prev => [...prev, { type: "ai", text: aiResponse }]);
      }
      
      setWorld(worldState);
      setPlayers(Object.values(worldState.players || {}));
    });

    socket.on("connect", () => {
      setConnected(true);
      setError(null); // Clear any previous errors on successful connection
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", (error) => {
      setConnected(false);
      setError("Connection failed. Please try again.");
    });

    socket.on("error", (data: { code: string; message: string; resetTime?: number }) => {
      setError(data.message);
      
      // Автоматически скрываем ошибку через заданное время
      setTimeout(() => setError(null), ERROR_AUTO_HIDE_DELAY);
    });

    return () => {
      // Cleanup socket connection
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, player]);

  const sendAction = (text: string) => {
    if (socketRef.current) {
      socketRef.current.emit("player_action", { roomId, playerId: player.id, action: text });
    }
  };

  return {
    socket: socketRef.current,
    connected,
    messages,
    world,
    players,
    error,
    sendAction
  };
}
