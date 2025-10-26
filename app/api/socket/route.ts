import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return new Response(JSON.stringify({
    message: "Socket server is running separately on port 3001",
    status: "running",
    endpoint: "http://localhost:3001/api/socket_io"
  }), { 
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

export async function POST(req: NextRequest) {
  return new Response(JSON.stringify({
    message: "Socket server is running separately on port 3001",
    status: "running",
    endpoint: "http://localhost:3001/api/socket_io"
  }), { 
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
