import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { createClient } from "redis";
import { config } from "./config/env.js";
import {
  IOServer,
  HTTPServerType,
  DrawingData,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "./types/socket.js";

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

// Redis client
const redis = createClient({
  url: config.redisUrl,
});

redis.on("error", (err: Error) => {
  console.error("Redis Client Error:", err);
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

const PIXEL_HISTORY_KEY = "pixel_history";

// Load pixel history from Redis
const loadPixelHistory = async (): Promise<DrawingData[]> => {
  try {
    const history = await redis.get(PIXEL_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Error loading pixel history:", error);
    return [];
  }
};

// Save pixel history to Redis
const savePixelHistory = async (history: DrawingData[]): Promise<void> => {
  try {
    await redis.set(PIXEL_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error saving pixel history:", error);
  }
};

let pixelHistory: DrawingData[] = [];

// Initialize server
const initializeServer = async () => {
  // Connect to Redis
  await redis.connect();

  // Load pixel history
  pixelHistory = await loadPixelHistory();
  console.log(`Loaded ${pixelHistory.length} pixels from Redis`);

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.id);

    // Send current history to new user
    socket.emit("drawing-history", pixelHistory);

    socket.on("draw", async (data: DrawingData) => {
      pixelHistory.push(data);

      // Save to Redis every 10 pixels to avoid too frequent writes
      if (pixelHistory.length % 10 === 0) {
        await savePixelHistory(pixelHistory);
      }

      socket.broadcast.emit("draw", data);
    });

    socket.on("clear-canvas", async () => {
      pixelHistory = [];
      await savePixelHistory(pixelHistory);
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
      pixelCount: pixelHistory.length,
    });
  });

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      connections: io.engine.clientsCount,
      pixelCount: pixelHistory.length,
    });
  });

  server.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`🎨 Pixel Art Editor ready`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Client URL: ${config.clientUrl}`);
    console.log(`📊 Redis connected: ${redis.isReady}`);
  });
};

// Start the server
initializeServer().catch(console.error);
