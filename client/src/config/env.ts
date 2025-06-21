export const config = {
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001",
  appName: process.env.NEXT_PUBLIC_APP_NAME || "My Pixel World",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

export type Config = typeof config;
