"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import GameRoom from "../components/GameRoom";

export default function Home() {
  const { data: session, status } = useSession();
  const [joined, setJoined] = useState(false);

  const player = {
    id: session?.user?.email || Math.random().toString(36).substr(2, 9),
    name: session?.user?.name || "Гость",
    str: 5,
    dex: 5,
    hp: 20,
    inventory: []
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {!joined ? (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Добро пожаловать в D&D AI Master</h1>
          
          {session ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Привет, {session.user?.name}!</p>
                <img 
                  src={session.user?.image || ""} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                />
                <p className="text-sm text-gray-500">Вы присоединитесь к общей комнате</p>
              </div>
              <button
                onClick={() => setJoined(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                Войти в игру
              </button>
              <button
                onClick={() => signOut()}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => signIn("google")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Войти через Google
              </button>
            </div>
          )}
        </div>
      ) : (
        <GameRoom roomId="main" player={player} />
      )}
    </main>
  );
}
