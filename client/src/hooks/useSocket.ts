import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { config } from "../config/env";

export const useSocket = (roomSlug: string = "main") => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [userCount, setUserCount] = useState(1);

  useEffect(() => {
    if (!socketRef.current) {
      setIsConnecting(true);
      socketRef.current = io(config.serverUrl, {
        transports: ["websocket", "polling"],
        timeout: 10000,
      });

      socketRef.current.on("connect", () => {
        setIsConnected(true);
        setIsConnecting(false);
        socketRef.current?.emit("join-room", roomSlug);
      });

      socketRef.current.on("disconnect", () => {
        setIsConnected(false);
        setIsConnecting(false);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Connection error:", error);
        setIsConnected(false);
        setIsConnecting(false);
      });

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

  useEffect(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("join-room", roomSlug);
    }
  }, [roomSlug, isConnected]);

  useEffect(() => {
    if (!socketRef.current) return;
    const handleUserCount = (count: number) => setUserCount(count);
    socketRef.current.on("user-count", handleUserCount);
    return () => {
      socketRef.current?.off("user-count", handleUserCount);
    };
  }, []);

  return { socket: socketRef.current, isConnected, isConnecting, userCount };
};
