"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import ActionForm from "./ActionForm";

interface Player {
  id: string;
  name: string;
  str: number;
}

interface GameRoomProps {
  roomId: string;
  player: Player;
}

interface Message {
  type: "system" | "ai" | "player";
  text: string;
  playerName?: string;
}

export default function GameRoom({ roomId, player }: GameRoomProps) {
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    console.log("Initializing socket connection...");
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const path = "/api/socket_io";
    const socket = io(url, {
      path,
      transports: ["polling", "websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });
    socketRef.current = socket;

    socket.emit("join_room", { roomId, player });

    socket.on("system", (m) => {
      console.log("System message received:", m);
      setMessages(prev => [...prev, { type: "system", text: m.msg }]);
    });

    socket.on("player_message", ({ playerName, action }) => {
      console.log("Player message received:", { playerName, action });
      setMessages(prev => [...prev, { type: "player", text: action, playerName }]);
    });
    
    socket.on("game_update", ({ aiResponse, worldState }) => {
      console.log("Game update received:", { aiResponse, worldState });
      console.log("AI Response length:", aiResponse.length);
      console.log("AI Response preview:", aiResponse.substring(0, 200) + "...");
      
      // Добавляем ответ DND Master только если он не пустой
      if (aiResponse && aiResponse.trim()) {
        setMessages(prev => [...prev, { type: "ai", text: aiResponse }]);
      }
      
      setPlayers(Object.values(worldState.players || {}));
    });

    socket.on("connect", () => {
      console.log("Connected to server");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnected(false);
    });

    return () => {
      console.log("Disconnecting socket...");
      socket.disconnect();
    };
  }, [roomId, player]);

  // Автоматический скролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendAction = (text: string) => {
    // Отправляем действие на сервер, он рассшлет всем
    console.log(`[CLIENT] Sending action: ${text}`);
    socketRef.current.emit("player_action", { roomId, playerId: player.id, action: text });
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="bg-white p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Общая комната</h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{connected ? 'Подключено' : 'Отключено'}</span>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-sm text-gray-600 mb-1">Игроки в комнате ({players.length}):</div>
          <div className="flex flex-wrap gap-2">
            {players.map((p, i) => (
              <div key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {messages.map((m, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-lg ${
                m.type === "system" 
                  ? "bg-blue-100 text-blue-800" 
                  : m.type === "player"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-green-100 text-green-800"
              }`}
            >
              <span className="font-semibold">
                {m.type === "system" ? "Система" : m.type === "player" ? (m.playerName || "Вы") : "DND Master"}:
              </span> {m.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="bg-white border-t pt-4 pb-20">
        <ActionForm onSubmit={sendAction} />
      </div>
    </div>
  );
}
