"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@mdi/react";
import { mdiChevronDown, mdiClose, mdiPlus } from "@mdi/js";
import { createSlug, isValidSlug } from "@/utils/slug";
import { usePopularRooms } from "@/hooks/usePopularRooms";
import { Socket } from "socket.io-client";

interface RoomNavigationProps {
  currentRoom: string;
  userCount: number;
  socket: Socket | null;
}

interface QuickJoinButtonProps {
  room: string;
  currentRoom: string;
  onJoin: (room: string) => void;
  pixelCount?: number;
}

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roomSlug: string) => void;
}

const QuickJoinButton = ({
  room,
  currentRoom,
  onJoin,
  pixelCount,
}: QuickJoinButtonProps) => (
  <button
    onClick={() => onJoin(room)}
    disabled={currentRoom === room}
    className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
      currentRoom === room
        ? "bg-blue-500 text-white !cursor-default"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
    title={pixelCount ? `${pixelCount} pixels` : undefined}
  >
    {room}
  </button>
);

const JoinModal = ({ isOpen, onClose, onSubmit }: JoinModalProps) => {
  const [newRoomSlug, setNewRoomSlug] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomSlug.trim()) {
      const slug = createSlug(newRoomSlug);
      if (isValidSlug(slug)) {
        onSubmit(slug);
        setNewRoomSlug("");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-xs mx-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-800">Join Room</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <Icon path={mdiClose} size={0.8} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Room Name
            </label>
            <input
              type="text"
              value={newRoomSlug}
              onChange={(e) => setNewRoomSlug(e.target.value)}
              placeholder="Enter room name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Room names will be converted to lowercase with hyphens
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Join Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function RoomNavigation({
  currentRoom,
  userCount,
  socket,
}: RoomNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const router = useRouter();
  const { popularRooms, isLoading } = usePopularRooms(socket);

  const handleJoinRoom = (roomSlug: string) => {
    router.push(`/${roomSlug}`);
    setIsOpen(false);
    setShowJoinModal(false);
  };

  const fallbackRooms = ["main", "art", "pixel", "creative", "test"];
  const displayRooms =
    popularRooms.length > 0
      ? popularRooms
      : fallbackRooms.map((slug) => ({ slug, pixelCount: 0 }));

  return (
    <>
      <div className="fixed top-2 right-2">
        <div className="flex items-start gap-2 relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 hover:bg-white transition-colors cursor-pointer"
            style={{ lineHeight: 0 }}
          >
            <Icon
              path={mdiChevronDown}
              size={0.8}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-1">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-gray-600">Room</div>
            </div>
            <div className="text-base font-bold text-blue-600">
              {currentRoom}
            </div>
            <div className="flex items-center gap-1 justify-end">
              <div
                className={`w-2 h-2 rounded-full ${
                  userCount > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <div className="text-xs text-gray-500">{userCount} online</div>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 min-w-44 border border-gray-200">
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">
                {isLoading ? "Loading..." : "Popular Rooms"}
              </h3>
              <div className="grid grid-cols-2 gap-1">
                {displayRooms.slice(0, 6).map((room) => (
                  <QuickJoinButton
                    key={room.slug}
                    room={room.slug}
                    currentRoom={currentRoom}
                    onJoin={handleJoinRoom}
                    pixelCount={room.pixelCount}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md text-xs font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-md flex items-center justify-center gap-1 cursor-pointer"
            >
              <Icon path={mdiPlus} size={0.6} />
              Join Custom Room
            </button>
          </div>
        )}
      </div>

      <JoinModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinRoom}
      />
    </>
  );
}
