import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

interface PopularRoom {
  slug: string;
  pixelCount: number;
  updatedAt: string;
}

export const usePopularRooms = (socket: Socket | null) => {
  const [popularRooms, setPopularRooms] = useState<PopularRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    const handlePopularRooms = (rooms: PopularRoom[]) => {
      setPopularRooms(rooms);
      setIsLoading(false);
    };

    socket.on("popular-rooms", handlePopularRooms);

    return () => {
      socket.off("popular-rooms", handlePopularRooms);
    };
  }, [socket]);

  return { popularRooms, isLoading };
};
