import { Server as SocketIOServer } from "socket.io";
import { worldState } from "./worldState";
import { callAI } from "./ai";

let io: SocketIOServer | null = null;

export function getSocketIO() {
  if (!io) {
    console.log("Creating Socket.IO server");
    io = new SocketIOServer({
      path: "/api/socket_io",
      cors: { 
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket) => {
      console.log("Игрок подключился", socket.id);

      socket.on("join_room", ({ roomId, player }) => {
        worldState.players[player.id] = { ...player, socketId: socket.id };
        socket.join(roomId);
        io!.to(roomId).emit("system", { msg: `${player.name} вошёл в игру.` });
        io!.to(roomId).emit("game_update", { aiResponse: "", worldState });
      });

      socket.on("player_action", async ({ roomId, playerId, action }) => {
        const player = worldState.players[playerId];
        console.log(`[SERVER] player_action received: ${playerId} - ${action}`);
        console.log(`[SERVER] player found:`, player);

        if (!player) {
          console.error(`[SERVER] Player not found: ${playerId}`);
          return;
        }

        // Отправляем команду игрока всем в комнате СРАЗУ
        console.log(`[SERVER] Sending player_message: ${player.name} - ${action}`);
        io!.to(roomId).emit("player_message", { 
          playerName: player.name, 
          action: action 
        });

        // простая механика
        const roll = Math.floor(Math.random() * 20) + 1 + player.str;
        const success = roll >= 12;
        if (success) worldState.locations.forge.npcs[0].hp -= 6;

        worldState.log.push({ player: player.id, action, roll, success });

        const prompt = `
          Игрок ${player.name} делает действие: "${action}".
          Контекст: Страж (HP ${worldState.locations.forge.npcs[0].hp}/12).
          Последние события: ${JSON.stringify(worldState.log.slice(-5))}
          Опиши художественно сцену и дай JSON-предложения для мира.
        `;
        const aiResponse = await callAI(prompt);
        console.log("AI response:", aiResponse);

        // Отправляем ответ ИИ только если он не пустой
        if (aiResponse && aiResponse.trim()) {
          io!.to(roomId).emit("game_update", { aiResponse, worldState });
        } else {
          // Если ИИ не ответил, отправляем только обновление состояния
          io!.to(roomId).emit("game_update", { aiResponse: "", worldState });
        }
      });

      socket.on("disconnect", () => {
        console.log("Игрок отключился", socket.id);
        // Находим и удаляем игрока из worldState
        const playerToRemove = Object.values(worldState.players).find((p: any) => p.socketId === socket.id);
        if (playerToRemove) {
          delete worldState.players[playerToRemove.id];
          // Уведомляем всех в комнате об отключении
          socket.rooms.forEach(roomId => {
            io!.to(roomId).emit("system", { msg: `${playerToRemove.name} покинул игру.` });
            io!.to(roomId).emit("game_update", { aiResponse: "", worldState });
          });
        }
      });
    });
  }
  
  return io;
}