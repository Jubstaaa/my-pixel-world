import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { createClient } from "redis";
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

interface Pixel {
  x: number;
  y: number;
  color: string;
}

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
const MAX_PIXELS = 10000; // Limit pixel history to prevent memory issues

const loadPixelHistory = async (): Promise<DrawingData[]> => {
  try {
    const history = await redis.get(PIXEL_HISTORY_KEY);
    const pixels = history ? JSON.parse(history) : [];

    // Limit the number of pixels loaded into memory
    if (pixels.length > MAX_PIXELS) {
      console.log(
        `Limiting pixel history from ${pixels.length} to ${MAX_PIXELS} pixels`
      );
      return pixels.slice(-MAX_PIXELS);
    }

    return pixels;
  } catch (error) {
    console.error("Error loading pixel history:", error);
    return [];
  }
};

const savePixelHistory = async (history: DrawingData[]): Promise<void> => {
  try {
    // Limit the number of pixels saved to Redis
    const limitedHistory =
      history.length > MAX_PIXELS ? history.slice(-MAX_PIXELS) : history;

    await redis.set(PIXEL_HISTORY_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error("Error saving pixel history:", error);
  }
};

let pixelHistory: DrawingData[] = [];

const initializeServer = async () => {
  await redis.connect();

  pixelHistory = await loadPixelHistory();
  console.log(`Loaded ${pixelHistory.length} pixels from Redis`);

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.id);

    // Send limited history to new users
    const limitedHistory =
      pixelHistory.length > MAX_PIXELS
        ? pixelHistory.slice(-MAX_PIXELS)
        : pixelHistory;
    socket.emit("drawing-history", limitedHistory);

    socket.on("draw", async (data: DrawingData) => {
      if (data.type === "erase") {
        const eraseData: { x: number; y: number } = JSON.parse(data.path);

        pixelHistory = pixelHistory.filter((pixelData) => {
          if (pixelData.type === "pixel" && pixelData.path) {
            const pixel: Pixel = JSON.parse(pixelData.path);
            return !(pixel.x === eraseData.x && pixel.y === eraseData.y);
          }
          return true;
        });
      } else {
        pixelHistory.push(data);
      }

      if (pixelHistory.length > MAX_PIXELS) {
        pixelHistory = pixelHistory.slice(-MAX_PIXELS);
      }

      if (pixelHistory.length % 50 === 0) {
        await savePixelHistory(pixelHistory);

        if (global.gc) {
          global.gc();
        }
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
      maxPixels: MAX_PIXELS,
    });
  });

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      connections: io.engine.clientsCount,
      pixelCount: pixelHistory.length,
      maxPixels: MAX_PIXELS,
      memoryUsage: process.memoryUsage(),
    });
  });

  server.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`🎨 Pixel Art Editor ready`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Client URL: ${config.clientUrl}`);
    console.log(`📊 Redis connected: ${redis.isReady}`);
    console.log(`💾 Max pixels in memory: ${MAX_PIXELS}`);
  });
};

initializeServer().catch(console.error);
