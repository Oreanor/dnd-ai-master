import { NextRequest } from "next/server";
import { getSocketIO } from "../../../lib/socket-server";

export async function GET(req: NextRequest) {
  console.log("Socket API route called");
  const io = getSocketIO();
  return new Response("Socket.IO server initialized", { status: 200 });
}

export async function POST(req: NextRequest) {
  console.log("Socket API POST route called");
  const io = getSocketIO();
  return new Response("Socket.IO server initialized", { status: 200 });
}
