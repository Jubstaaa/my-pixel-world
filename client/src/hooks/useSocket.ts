import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { config } from "../config/env";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    if (!socketRef.current) {
      setIsConnecting(true);
      socketRef.current = io(config.serverUrl, {
        transports: ["websocket", "polling"],
        timeout: 10000,
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to server");
        setIsConnected(true);
        setIsConnecting(false);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsConnected(false);
        setIsConnecting(false);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Connection error:", error);
        setIsConnected(false);
        setIsConnecting(false);
      });

      // Timeout for connection
      const timeout = setTimeout(() => {
        if (!socketRef.current?.connected) {
          setIsConnecting(false);
        }
      }, 10000);

      return () => {
        clearTimeout(timeout);
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, []);

  return { socket: socketRef.current, isConnected, isConnecting };
};
