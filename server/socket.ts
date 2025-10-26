import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import { worldState } from "../lib/worldState";
import { callAI } from "../lib/ai";

const PORT = Number(process.env.SOCKET_PORT || 3001);
const PATH = process.env.SOCKET_PATH || "/api/socket_io";
const ORIGIN = process.env.SOCKET_CORS_ORIGIN || "*";

// Create a dedicated HTTP server and attach socket.io to it
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end("Socket server is running.\n");
});

const io = new Server(server, {
  path: PATH,
  cors: { origin: ORIGIN, methods: ["GET", "POST"] }
});

io.on("connection", (socket) => {
  console.log("Игрок подключился", socket.id);

  socket.on("join_room", ({ roomId, player }) => {
    // Сохраняем socketId для последующего удаления
    worldState.players[player.id] = { ...player, socketId: socket.id };
    socket.join(roomId);
    io.to(roomId).emit("system", { msg: `${player.name} вошёл в игру.` });
    // Отправляем обновленный список игроков
    io.to(roomId).emit("game_update", { aiResponse: "", worldState });
  });

  socket.on("player_action", async ({ roomId, playerId, action }) => {
    try {
      const player = worldState.players[playerId];

      // Отправляем команду игрока всем в комнате СРАЗУ
      console.log(`[SERVER] Sending player_message: ${player.name} - ${action}`);
      io.to(roomId).emit("player_message", { 
        playerName: player.name, 
        action: action 
      });

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

      // Отправляем ответ ИИ только если он не пустой
      if (aiResponse && aiResponse.trim()) {
        io.to(roomId).emit("game_update", { aiResponse, worldState });
      } else {
        // Если ИИ не ответил, отправляем только обновление состояния
        io.to(roomId).emit("game_update", { aiResponse: "", worldState });
      }
    } catch (error: any) {
      console.error("[socket] player_action failed:", error?.message || error);
      io.to(roomId).emit("game_update", { aiResponse: "AI error. Fallback used.", worldState });
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
        io.to(roomId).emit("system", { msg: `${playerToRemove.name} покинул игру.` });
        io.to(roomId).emit("game_update", { aiResponse: "", worldState });
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`[socket] listening on http://localhost:${PORT}${PATH}`);
});

process.on("unhandledRejection", (reason) => {
  console.error("[socket] UnhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[socket] UncaughtException:", err);
});


