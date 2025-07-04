import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "./config/env";
import { IOServer, HTTPServerType, DrawingData } from "./types/socket";
import { Canvas, IPixel } from "./models/Canvas";

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

const loadPixelHistory = async (): Promise<DrawingData[]> => {
  try {
    let canvas = await Canvas.findOne();

    if (!canvas) {
      canvas = await Canvas.create({ pixels: [] });
    }

    return canvas.pixels.map((pixel: IPixel) => ({
      path: JSON.stringify({ x: pixel.x, y: pixel.y }),
      color: pixel.color,
    }));
  } catch (error) {
    console.error("Error loading pixel history:", error);
    return [];
  }
};

const saveAllPixels = async (pixelHistory: DrawingData[]): Promise<void> => {
  try {
    const pixelsToSave = pixelHistory.map((pixelData) => {
      const { x, y } = JSON.parse(pixelData.path);
      return { x, y, color: pixelData.color };
    });

    await Canvas.findOneAndUpdate(
      {},
      {
        pixels: pixelsToSave,
        lastUpdated: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );
  } catch (error) {
    console.error("Error saving canvas:", error);
  }
};

let pixelHistory: DrawingData[] = [];

const initializeServer = async () => {
  pixelHistory = await loadPixelHistory();

  setInterval(() => {
    saveAllPixels(pixelHistory);
  }, 15000);

  io.on("connection", async (socket) => {
    socket.emit("drawing-history", pixelHistory);
    socket.on("draw", async (data: DrawingData) => {
      const pixels: { x: number; y: number; color?: string }[] = JSON.parse(
        data.path
      );

      if (!data.color) {
        for (const erasePixel of pixels) {
          pixelHistory = pixelHistory.filter((pixelData) => {
            if (pixelData.path) {
              const pixel = JSON.parse(pixelData.path);
              return !(pixel.x === erasePixel.x && pixel.y === erasePixel.y);
            }
            return true;
          });
        }
      } else {
        for (const pixel of pixels) {
          if (!pixel.color && !data.color) continue;

          pixelHistory = pixelHistory.filter((p) => {
            const { x, y } = JSON.parse(p.path);
            return !(x === pixel.x && y === pixel.y);
          });

          const newPixel = {
            path: JSON.stringify({ x: pixel.x, y: pixel.y }),
            color: pixel.color || data.color,
          };
          pixelHistory.push(newPixel);
        }
      }

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
