"use client";

import { useCanvas } from "@/hooks/useCanvas";
import { useCanvasEvents } from "@/hooks/useCanvasEvents";
import { Toolbar } from "@/components/Toolbar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { getToolCursor } from "@/utils/canvas";

export default function DrawingCanvas() {
  const {
    canvasRef,
    hoverCanvasRef,
    contextRef,
    lastHoveredPixel,
    isConnected,
    isConnecting,
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
    drawPixel,
    erasePixel,
    drawBatchPixels,
    eraseBatchPixels,
  } = useCanvas();

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
      drawPixel,
      erasePixel,
      drawBatchPixels,
      eraseBatchPixels,
      drawGrid,
    });

  return (
    <>
      <LoadingScreen isConnected={isConnected} isConnecting={isConnecting} />

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
          isConnected={isConnected}
        />
      </div>
    </>
  );
}
