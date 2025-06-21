import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { config } from "./config/env";
import {
  IOServer,
  HTTPServerType,
  DrawingData,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "./types/socket";

const app = express();
const server: HTTPServerType = createServer(app);

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

const io: IOServer = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const pixelHistory: DrawingData[] = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.emit("drawing-history", pixelHistory);

  socket.on("draw", (data: DrawingData) => {
    pixelHistory.push(data);
    socket.broadcast.emit("draw", data);
  });

  socket.on("clear-canvas", () => {
    pixelHistory.length = 0;
    socket.broadcast.emit("clear-canvas");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Pixel Art Server is running!",
    environment: config.nodeEnv,
    clientUrl: config.clientUrl,
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
  });
});

server.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`🎨 Pixel Art Editor ready`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Client URL: ${config.clientUrl}`);
});
