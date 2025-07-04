import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

export interface DrawingData {
  path: string;
  color: string;
}

export interface Pixel {
  x: number;
  y: number;
  color: string;
}

export interface PopularRoom {
  slug: string;
  pixelCount: number;
  updatedAt: string;
}

export interface ServerToClientEvents {
  "drawing-history": (history: DrawingData[]) => void;
  draw: (data: DrawingData) => void;
  "clear-canvas": () => void;
  "user-count": (count: number) => void;
  "join-room": (roomSlug: string) => void;
  "popular-rooms": (rooms: PopularRoom[]) => void;
}

export interface ClientToServerEvents {
  draw: (data: DrawingData) => void;
  "clear-canvas": () => void;
  "join-room": (roomSlug: string) => void;
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
