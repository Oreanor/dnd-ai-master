import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import { worldState } from "../lib/worldState";
import { callAI, generateAIContext, generateWelcomeContext } from "../lib/ai";
import { rateLimiters, getClientId, sendRateLimitError } from "../utils/rateLimiter";
import { validators } from "../utils/validators";
import { gameLogger } from "../utils/logger";
import { ErrorHandler, ValidationError, AIError, SocketError } from "../lib/errors";
import { CONFIG } from "../config/constants";

const PORT = Number(process.env.SOCKET_PORT || 3001);

// Create a dedicated HTTP server and attach socket.io to it
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end("Socket server is running.\n");
});

const io = new Server(server, {
  path: process.env.SOCKET_PATH || "/api/socket_io",
  cors: { origin: process.env.SOCKET_CORS_ORIGIN || "*", methods: ["GET", "POST"] }
});

io.on("connection", (socket) => {
  const clientId = getClientId(socket);
  console.log("Игрок подключился", socket.id, "Client ID:", clientId);

  socket.on("join_room", async (data) => {
    try {
      // Проверяем rate limit
      if (!rateLimiters.joinRoom.isAllowed(clientId)) {
        const resetTime = rateLimiters.joinRoom.getResetTime(clientId);
        sendRateLimitError(socket, rateLimiters.joinRoom.config.message, resetTime);
        gameLogger.rateLimitHit(clientId, 'joinRoom');
        return;
      }

      // Валидируем данные
      const roomId = validators.roomId(data?.roomId, 'roomId');
      const player = validators.player(data?.player, 'player');

      // Сохраняем socketId для последующего удаления
      worldState.players[player.id] = { ...player, socketId: socket.id };
      socket.join(roomId);
      
      gameLogger.playerJoin(player.name, clientId);
      io.to(roomId).emit("system", { msg: `${player.name} вошёл в игру.` });
    
    // Проверяем, нужно ли генерировать описание локации
    const playersInRoom = Object.values(worldState.players).length;
    const isFirstPlayer = playersInRoom === 1;
    const needsLocationGeneration = isFirstPlayer && !worldState.isLocationGenerated;
    
    if (needsLocationGeneration) {
      // Генерируем приветственное описание локации только для первого игрока в новой сессии
      console.log(`[SERVER] First player joined, generating welcome description`);
      const welcomePrompt = generateWelcomeContext(worldState);
      const welcomeResponse = await callAI(welcomePrompt);
      
      if (welcomeResponse && welcomeResponse.trim()) {
        // Обновляем контекст с описанием локации
        worldState.context.currentScene = welcomeResponse;
        worldState.context.lastAIResponse = welcomeResponse;
        worldState.isLocationGenerated = true; // Отмечаем, что локация уже сгенерирована
        
        // Отправляем описание локации всем в комнате
        io.to(roomId).emit("game_update", { aiResponse: welcomeResponse, worldState });
      } else {
        // Если AI не ответил, отправляем базовое описание
        worldState.isLocationGenerated = true; // Все равно отмечаем как сгенерированную
        io.to(roomId).emit("game_update", { aiResponse: "", worldState });
      }
    } else {
      // Для остальных игроков или при реконнекте просто отправляем обновленное состояние
      io.to(roomId).emit("game_update", { aiResponse: "", worldState });
    }
    } catch (error: unknown) {
      const appError = ErrorHandler.handle(error, 'join_room');
      ErrorHandler.logError(appError, `Client: ${clientId}`);
      
      if (appError instanceof ValidationError) {
        gameLogger.validationError(appError.message, clientId);
        socket.emit("error", { code: "VALIDATION_ERROR", message: appError.message });
      } else {
        gameLogger.socketError(appError.message, clientId);
        socket.emit("error", { code: "INTERNAL_ERROR", message: "Произошла ошибка сервера" });
      }
    }
  });

  socket.on("player_action", async (data) => {
    try {
      // Проверяем rate limit
      if (!rateLimiters.playerAction.isAllowed(clientId)) {
        const resetTime = rateLimiters.playerAction.getResetTime(clientId);
        sendRateLimitError(socket, rateLimiters.playerAction.config.message, resetTime);
        gameLogger.rateLimitHit(clientId, 'playerAction');
        return;
      }

      // Валидируем данные
      const roomId = validators.roomId(data?.roomId, 'roomId');
      const playerId = validators.playerId(data?.playerId, 'playerId');
      const action = validators.playerAction(data?.action, 'action');

      const player = worldState.players[playerId];
      if (!player) {
        socket.emit("error", { code: "PLAYER_NOT_FOUND", message: "Игрок не найден" });
        return;
      }

      // Отправляем команду игрока всем в комнате СРАЗУ
      gameLogger.playerAction(player.name, action, clientId);
      io.to(roomId).emit("player_message", { 
        playerName: player.name, 
        action: action 
      });

      const roll = Math.floor(Math.random() * 20) + 1 + player.str;
      const success = roll >= 12;
      
      // Обновляем состояние мира
      if (success) worldState.locations.forge.npcs[0].hp -= 6;
      
      // Добавляем событие в лог
      const logEntry = { player: player.id, action, roll, success };
      worldState.log.push(logEntry);
      
      // Обновляем контекст - добавляем событие в недавние
      worldState.context.recentEvents.push(logEntry);
      // Ограничиваем количество недавних событий
      if (worldState.context.recentEvents.length > 5) {
        worldState.context.recentEvents = worldState.context.recentEvents.slice(-5);
      }

      // Проверяем rate limit для AI запросов
      if (!rateLimiters.aiRequest.isAllowed(clientId)) {
        const resetTime = rateLimiters.aiRequest.getResetTime(clientId);
        sendRateLimitError(socket, rateLimiters.aiRequest.config.message, resetTime);
        gameLogger.rateLimitHit(clientId, 'aiRequest');
        return;
      }

      // Генерируем контекст для AI
      const prompt = generateAIContext(player.name, action, worldState);
      let aiResponse = "";
      
      try {
        aiResponse = await callAI(prompt);
        gameLogger.aiResponse(aiResponse.length, clientId);
      } catch (aiError: unknown) {
        const appError = ErrorHandler.handle(aiError, 'ai_call');
        ErrorHandler.logError(appError, `Client: ${clientId}`);
        
        if (appError instanceof AIError) {
          gameLogger.socketError(`AI Error: ${appError.message}`, clientId);
          // Continue with empty response instead of failing completely
        } else {
          gameLogger.socketError(`Unexpected AI Error: ${appError.message}`, clientId);
        }
      }
      
      // Обновляем контекст с ответом AI
      if (aiResponse && aiResponse.trim()) {
        worldState.context.lastAIResponse = aiResponse;
        // Обновляем описание сцены на основе ответа AI
        worldState.context.currentScene = aiResponse;
      }

      // Отправляем ответ DND Master только если он не пустой
      if (aiResponse && aiResponse.trim()) {
        io.to(roomId).emit("game_update", { aiResponse, worldState });
      } else {
        // Если DND Master не ответил, отправляем только обновление состояния
        io.to(roomId).emit("game_update", { aiResponse: "", worldState });
      }
    } catch (error: unknown) {
      const appError = ErrorHandler.handle(error, 'join_room');
      ErrorHandler.logError(appError, `Client: ${clientId}`);
      
      if (appError instanceof ValidationError) {
        gameLogger.validationError(appError.message, clientId);
        socket.emit("error", { code: "VALIDATION_ERROR", message: appError.message });
      } else {
        gameLogger.socketError(appError.message, clientId);
        socket.emit("error", { code: "INTERNAL_ERROR", message: "Произошла ошибка сервера" });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Игрок отключился", socket.id);
    // Находим и удаляем игрока из worldState
    const playerToRemove = Object.values(worldState.players).find((p: any) => p.socketId === socket.id);
    if (playerToRemove) {
      gameLogger.playerLeave(playerToRemove.name, clientId);
      delete worldState.players[playerToRemove.id];
      
      // Проверяем, остались ли игроки в комнате
      const remainingPlayers = Object.values(worldState.players).length;
      
      // Если никого не осталось, сбрасываем контекст к начальному состоянию
      if (remainingPlayers === 0) {
        console.log("[SERVER] All players left, resetting context");
        worldState.context.currentScene = "Вы находитесь в заброшенной кузнице. В углу стоит страж, который смотрит на вас с подозрением.";
        worldState.context.lastAIResponse = "";
        worldState.context.recentEvents = [];
        worldState.log = [];
        worldState.isLocationGenerated = false; // Сбрасываем флаг генерации локации
        // Сбрасываем HP стража
        worldState.locations.forge.npcs[0].hp = 12;
      }
      
      // Уведомляем всех в комнате об отключении
      socket.rooms.forEach(roomId => {
        io.to(roomId).emit("system", { msg: `${playerToRemove.name} покинул игру.` });
        io.to(roomId).emit("game_update", { aiResponse: "", worldState });
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`[socket] listening on http://localhost:${PORT}${process.env.SOCKET_PATH || "/api/socket_io"}`);
});

process.on("unhandledRejection", (reason) => {
  console.error("[socket] UnhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[socket] UncaughtException:", err);
});


