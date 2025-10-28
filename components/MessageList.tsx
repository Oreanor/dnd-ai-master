import { useEffect, useRef } from "react";
import { Message } from "../types";

interface MessageListProps {
  messages: Message[];
}

const MESSAGE_STYLES = {
  system: "bg-blue-100 text-blue-800",
  player: "bg-gray-100 text-gray-700", 
  ai: "bg-green-100 text-green-800"
};

const MESSAGE_LABELS = {
  system: "Система",
  player: (playerName?: string) => playerName || "Вы",
  ai: "DND Master"
};

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоматический скролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-2">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-lg ${MESSAGE_STYLES[message.type]}`}
          >
            <span className="font-semibold">
              {message.type === "player" 
                ? MESSAGE_LABELS.player(message.playerName)
                : MESSAGE_LABELS[message.type]
              }:
            </span> {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
