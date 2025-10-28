export const SOCKET_CONFIG = {
  url: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
  path: "/api/socket_io",
  options: {
    transports: ["polling", "websocket"] as const,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000
  }
} as const;

export const ERROR_AUTO_HIDE_DELAY = 5000; // 5 секунд
