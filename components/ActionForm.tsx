"use client";
import { useState } from "react";
import { ActionFormProps } from "../types";

export default function ActionForm({ onSubmit }: ActionFormProps) {
  const [action, setAction] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (action.trim()) {
      onSubmit(action.trim());
      setAction("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4">
      <input
        type="text"
        value={action}
        onChange={(e) => setAction(e.target.value)}
        placeholder="Введите действие..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        Отправить
      </button>
    </form>
  );
}
