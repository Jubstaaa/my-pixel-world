import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "./config/env";
import { IOServer, HTTPServerType, DrawingData } from "./types/socket";
import { Room, IPixel } from "./models/Room";
import { createSlug, isValidSlug } from "./utils/slug";
import { RoomService } from "./services/RoomService";
import { SocketHandler } from "./handlers/SocketHandler";

const app = express();
const server: HTTPServerType = createServer(app);

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

const io: IOServer = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

mongoose
  .connect(config.mongodbUri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err: Error) => {
    console.error("MongoDB connection error:", err);
  });

const roomService = new RoomService();
const socketHandler = new SocketHandler(io, roomService);

const initializeServer = async () => {
  await roomService.loadAllRoomsFromDB();
  await roomService.initializeMainRoom();
  roomService.startAutoSave();

  io.on("connection", (socket) => {
    socketHandler.handleConnection(socket);
  });

  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

initializeServer().catch(console.error);
