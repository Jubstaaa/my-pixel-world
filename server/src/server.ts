import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { createClient } from "redis";
import { config } from "./config/env";
import { IOServer, HTTPServerType, DrawingData } from "./types/socket";

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

const redis = createClient({ url: config.redisUrl });
redis.on("error", (err: Error) => {
  console.error("Redis Client Error:", err);
});
redis.on("connect", () => {
  console.log("Connected to Redis");
});

const PIXEL_HISTORY_KEY = "pixel_history";

const loadPixelHistory = async (): Promise<DrawingData[]> => {
  try {
    const history = await redis.get(PIXEL_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

const savePixelHistory = async (history: DrawingData[]) => {
  try {
    await redis.set(PIXEL_HISTORY_KEY, JSON.stringify(history));
  } catch {}
};

let pixelHistory: DrawingData[] = [];

const initializeServer = async () => {
  await redis.connect();
  pixelHistory = await loadPixelHistory();
  setInterval(() => {
    savePixelHistory(pixelHistory);
  }, 15000);

  io.on("connection", async (socket) => {
    socket.emit("drawing-history", pixelHistory);
    socket.on("draw", async (data: DrawingData) => {
      const pixels: { x: number; y: number; color?: string }[] = JSON.parse(
        data.path
      );
      if (!data.color) {
        pixels.forEach((erasePixel) => {
          pixelHistory = pixelHistory.filter((pixelData) => {
            if (pixelData.path) {
              const pixel = JSON.parse(pixelData.path);
              return !(pixel.x === erasePixel.x && pixel.y === erasePixel.y);
            }
            return true;
          });
        });
      } else {
        pixels.forEach((pixel) => {
          if (!pixel.color && !data.color) return;
          pixelHistory = pixelHistory.filter((p) => {
            const { x, y } = JSON.parse(p.path);
            return !(x === pixel.x && y === pixel.y);
          });
          pixelHistory.push({
            path: JSON.stringify({ x: pixel.x, y: pixel.y }),
            color: pixel.color || data.color,
          });
        });
      }
      console.log(pixelHistory.slice(-20));
      socket.broadcast.emit("draw", data);
    });

    const sendUserCount = () => {
      io.emit("user-count", io.engine.clientsCount);
    };
    sendUserCount();

    socket.on("disconnect", () => {
      sendUserCount();
    });
  });

  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

initializeServer().catch(console.error);
