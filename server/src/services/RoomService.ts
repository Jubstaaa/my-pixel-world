import { Room, IPixel } from "../models/Room";
import { DrawingData } from "../types/socket";

interface RoomInfo {
  slug: string;
  pixelCount: number;
  updatedAt: Date;
}

export class RoomService {
  private roomPixelHistories: Map<string, DrawingData[]> = new Map();
  private roomInfo: Map<string, RoomInfo> = new Map();

  async loadAllRoomsFromDB(): Promise<void> {
    try {
      const rooms = await Room.find({});

      rooms.forEach((room) => {
        const pixelHistory = room.pixels.map((pixel: IPixel) => ({
          path: JSON.stringify({ x: pixel.x, y: pixel.y }),
          color: pixel.color,
        }));

        this.roomPixelHistories.set(room.slug, pixelHistory);
        this.roomInfo.set(room.slug, {
          slug: room.slug,
          pixelCount: pixelHistory.length,
          updatedAt: room.updatedAt,
        });
      });
    } catch (error) {
      console.error("Error loading rooms from database:", error);
    }
  }

  async saveAllRoomsToDB(): Promise<void> {
    try {
      const savePromises = Array.from(this.roomPixelHistories.entries()).map(
        async ([slug, pixelHistory]) => {
          const pixelsToSave = pixelHistory.map((pixelData) => {
            const { x, y } = JSON.parse(pixelData.path);
            return { x, y, color: pixelData.color };
          });

          await Room.findOneAndUpdate(
            { slug },
            {
              pixels: pixelsToSave,
              updatedAt: new Date(),
            },
            { upsert: true, new: true }
          );
        }
      );

      await Promise.all(savePromises);
    } catch (error) {
      console.error("Error saving rooms to database:", error);
    }
  }

  async initializeMainRoom(): Promise<void> {
    if (!this.roomPixelHistories.has("main")) {
      this.roomPixelHistories.set("main", []);
      this.roomInfo.set("main", {
        slug: "main",
        pixelCount: 0,
        updatedAt: new Date(),
      });
    }
  }

  startAutoSave(): void {
    setInterval(() => {
      this.saveAllRoomsToDB();
    }, 15000);
  }

  getRoomHistory(roomSlug: string): DrawingData[] {
    return this.roomPixelHistories.get(roomSlug) || [];
  }

  setRoomHistory(roomSlug: string, history: DrawingData[]): void {
    this.roomPixelHistories.set(roomSlug, history);

    this.roomInfo.set(roomSlug, {
      slug: roomSlug,
      pixelCount: history.length,
      updatedAt: new Date(),
    });
  }

  hasRoom(roomSlug: string): boolean {
    return this.roomPixelHistories.has(roomSlug);
  }

  createRoom(roomSlug: string): void {
    if (!this.roomPixelHistories.has(roomSlug)) {
      this.roomPixelHistories.set(roomSlug, []);
      this.roomInfo.set(roomSlug, {
        slug: roomSlug,
        pixelCount: 0,
        updatedAt: new Date(),
      });
    }
  }

  getPopularRooms(): Array<{
    slug: string;
    pixelCount: number;
    updatedAt: string;
  }> {
    const rooms = Array.from(this.roomInfo.values())
      .sort((a, b) => {
        if (a.pixelCount !== b.pixelCount) {
          return b.pixelCount - a.pixelCount;
        }
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      })
      .slice(0, 6)
      .map((room) => ({
        slug: room.slug,
        pixelCount: room.pixelCount,
        updatedAt: room.updatedAt.toISOString(),
      }));

    return rooms;
  }
}
