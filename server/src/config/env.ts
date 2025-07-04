import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/pixel-world",
} as const;

export type Config = typeof config;
