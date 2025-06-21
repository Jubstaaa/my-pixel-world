import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { config } from "../config/env";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(config.serverUrl, {
        transports: ["websocket", "polling"],
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to server");
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Connection error:", error);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return socketRef.current;
};
