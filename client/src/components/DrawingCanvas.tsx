"use client";

import { useCanvas } from "@/hooks/useCanvas";
import { useCanvasEvents } from "@/hooks/useCanvasEvents";
import { Toolbar } from "@/components/Toolbar";
import { LoadingScreen } from "@/components/LoadingScreen";
import RoomNavigation from "@/components/RoomNavigation";
import { getToolCursor } from "@/utils/canvas";
import { useSocket } from "@/hooks/useSocket";

interface DrawingCanvasProps {
  roomSlug?: string;
}

export default function DrawingCanvas({
  roomSlug = "main",
}: DrawingCanvasProps) {
  const { socket, userCount, isConnected, isConnecting } = useSocket(roomSlug);
  const {
    canvasRef,
    hoverCanvasRef,
    contextRef,
    lastHoveredPixel,
    color,
    setColor,
    pixelSize,
    currentTool,
    setCurrentTool,
    isPanning,
    setIsPanning,
    panOffset,
    setPanOffset,
    lastPanPoint,
    setLastPanPoint,
    drawGrid,
    drawPixels,
    erasePixels,
  } = useCanvas(socket, roomSlug);

  const { handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave } =
    useCanvasEvents({
      canvasRef,
      hoverCanvasRef,
      contextRef,
      lastHoveredPixel,
      currentTool,
      color,
      pixelSize,
      isPanning,
      panOffset,
      lastPanPoint,
      setIsPanning,
      setPanOffset,
      setLastPanPoint,
      drawPixels,
      erasePixels,
      drawGrid,
    });

  return (
    <>
      <LoadingScreen isConnected={isConnected} isConnecting={isConnecting} />
      <RoomNavigation
        currentRoom={roomSlug}
        userCount={userCount}
        socket={socket}
      />

      <div className="relative w-screen h-screen overflow-hidden">
        <div
          className="absolute"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            cursor: getToolCursor(currentTool),
          }}
          onMouseLeave={handleMouseLeave}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="block"
            style={{
              backgroundColor: "#ffffff",
              touchAction: "none",
            }}
          />
          <canvas
            ref={hoverCanvasRef}
            className="absolute top-0 left-0 pointer-events-none"
          />
        </div>

        <Toolbar
          color={color}
          setColor={setColor}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />
      </div>
    </>
  );
}
