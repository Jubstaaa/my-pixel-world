import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

export interface DrawingData {
  type: string;
  path: string;
  color: string;
  brushSize: number;
  userId: string;
  timestamp: number;
}

export interface Pixel {
  x: number;
  y: number;
  color: string;
}

export interface ServerToClientEvents {
  "drawing-history": (history: DrawingData[]) => void;
  draw: (data: DrawingData) => void;
  "clear-canvas": () => void;
}

export interface ClientToServerEvents {
  draw: (data: DrawingData) => void;
  "clear-canvas": () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
}

export type IOServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type HTTPServerType = HTTPServer;
