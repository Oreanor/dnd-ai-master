import ActionForm from "./ActionForm";
import MessageList from "./MessageList";
import PlayerList from "./PlayerList";
import ConnectionStatus from "./ConnectionStatus";
import ErrorAlert from "./ErrorAlert";
import { useSocket } from "../hooks/useSocket";
import { GameRoomProps } from "../types";

export default function GameRoom({ roomId, player }: GameRoomProps) {
  const { connected, messages, players, error, sendAction } = useSocket({ roomId, player });

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <ErrorAlert error={error} />
      
      <div className="bg-white p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Общая комната</h2>
          <ConnectionStatus connected={connected} />
        </div>
        <PlayerList players={players} />
      </div>
      
      <MessageList messages={messages} />
      
      <div className="bg-white border-t pt-4 pb-20">
        <ActionForm onSubmit={sendAction} />
      </div>
    </div>
  );
}
