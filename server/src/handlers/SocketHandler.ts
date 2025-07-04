import { Socket } from "socket.io";
import { IOServer } from "../types/socket";
import { DrawingData } from "../types/socket";
import { RoomService } from "../services/RoomService";
import { createSlug, isValidSlug } from "../utils/slug";

export class SocketHandler {
  constructor(private io: IOServer, private roomService: RoomService) {}

  handleConnection(socket: Socket): void {
    let currentRoom = "main";

    socket.on("join-room", (roomSlug: string) => {
      const normalizedSlug = createSlug(roomSlug);

      if (!isValidSlug(normalizedSlug)) {
        return;
      }

      socket.leave(currentRoom);
      currentRoom = normalizedSlug;
      socket.join(normalizedSlug);

      if (!this.roomService.hasRoom(normalizedSlug)) {
        this.roomService.createRoom(normalizedSlug);
      }

      const roomHistory = this.roomService.getRoomHistory(normalizedSlug);
      socket.emit("drawing-history", roomHistory);

      this.updateUserCount(normalizedSlug);
    });

    socket.emit("join-room", "main");

    socket.on("draw", (data: DrawingData) => {
      const pixels: { x: number; y: number; color?: string }[] = JSON.parse(
        data.path
      );
      const pixelHistory = this.roomService.getRoomHistory(currentRoom);

      if (!data.color) {
        for (const erasePixel of pixels) {
          pixelHistory.splice(
            0,
            pixelHistory.length,
            ...pixelHistory.filter((pixelData: DrawingData) => {
              if (pixelData.path) {
                const pixel = JSON.parse(pixelData.path);
                return !(pixel.x === erasePixel.x && pixel.y === erasePixel.y);
              }
              return true;
            })
          );
        }
      } else {
        for (const pixel of pixels) {
          if (!pixel.color && !data.color) continue;

          pixelHistory.splice(
            0,
            pixelHistory.length,
            ...pixelHistory.filter((p: DrawingData) => {
              const { x, y } = JSON.parse(p.path);
              return !(x === pixel.x && y === pixel.y);
            })
          );

          const newPixel = {
            path: JSON.stringify({ x: pixel.x, y: pixel.y }),
            color: pixel.color || data.color,
          };
          pixelHistory.push(newPixel);
        }
      }

      this.roomService.setRoomHistory(currentRoom, pixelHistory);
      socket.to(currentRoom).emit("draw", data);
    });

    socket.on("disconnect", () => {
      this.updateUserCount(currentRoom);
    });

    const popularRooms = this.roomService.getPopularRooms();
    socket.emit("popular-rooms", popularRooms);
  }

  private updateUserCount(roomSlug: string): void {
    const userCount = this.io.sockets.adapter.rooms.get(roomSlug)?.size || 0;
    this.io.to(roomSlug).emit("user-count", userCount);
  }
}
