import { Player } from "../types";

interface PlayerListProps {
  players: Player[];
}

export default function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="mt-2">
      <div className="text-sm text-gray-600 mb-1">
        Игроки в комнате ({players.length}):
      </div>
      <div className="flex flex-wrap gap-2">
        {players.map((player, index) => (
          <div 
            key={player.id || index} 
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
          >
            {player.name}
          </div>
        ))}
      </div>
    </div>
  );
}
