import { useEffect, useRef } from "react";
import { Tool, Point } from "@/types/canvas";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/constants/canvas";
import {
  getGridPosition,
  isWithinCanvas,
  constrainPanOffset,
} from "@/utils/canvas";

interface UseCanvasEventsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  hoverCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  contextRef: React.RefObject<CanvasRenderingContext2D | null>;
  lastHoveredPixel: React.MutableRefObject<Point | null>;
  currentTool: Tool;
  color: string;
  pixelSize: number;
  isPanning: boolean;
  panOffset: Point;
  lastPanPoint: Point;
  setIsPanning: (panning: boolean) => void;
  setPanOffset: (offset: Point | ((prev: Point) => Point)) => void;
  setLastPanPoint: (point: Point) => void;
  drawPixel: (x: number, y: number, color: string, emitEvent?: boolean) => void;
  drawGrid: () => void;
}

export const useCanvasEvents = ({
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
  drawGrid,
}: UseCanvasEventsProps) => {
  const drawGridRef = useRef(drawGrid);
  drawGridRef.current = drawGrid;

  useEffect(() => {
    const hoverContext = hoverCanvasRef.current?.getContext("2d");
    if (hoverContext && lastHoveredPixel.current) {
      hoverContext.clearRect(
        lastHoveredPixel.current.x * pixelSize,
        lastHoveredPixel.current.y * pixelSize,
        pixelSize,
        pixelSize
      );
      lastHoveredPixel.current = null;
    }
  }, [currentTool, pixelSize, hoverCanvasRef, lastHoveredPixel]);

  useEffect(() => {
    if (canvasRef.current && hoverCanvasRef.current) {
      const canvas = canvasRef.current;
      const hoverCanvas = hoverCanvasRef.current;
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      hoverCanvas.width = CANVAS_WIDTH;
      hoverCanvas.height = CANVAS_HEIGHT;

      const context = canvas.getContext("2d");
      if (context) {
        contextRef.current = context;
        drawGridRef.current();
      }
    }
  }, [canvasRef, hoverCanvasRef, contextRef]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === "hand") {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else {
      const { x, y } = getGridPosition(e, panOffset, pixelSize);
      if (isWithinCanvas(x, y, pixelSize)) {
        const drawColor = currentTool === "eraser" ? "#ffffff" : color;
        drawPixel(x, y, drawColor, true);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === "hand" && isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;

      setPanOffset((prev) => {
        const newOffset = {
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        };
        return constrainPanOffset(newOffset);
      });

      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else if (e.buttons === 1 && currentTool !== "hand") {
      const { x, y } = getGridPosition(e, panOffset, pixelSize);
      if (isWithinCanvas(x, y, pixelSize)) {
        const drawColor = currentTool === "eraser" ? "#ffffff" : color;
        drawPixel(x, y, drawColor, true);
      }
    }

    const hoverContext = hoverCanvasRef.current?.getContext("2d");
    if (!hoverContext) return;

    const { x: gridX, y: gridY } = getGridPosition(e, panOffset, pixelSize);

    if (
      lastHoveredPixel.current?.x === gridX &&
      lastHoveredPixel.current?.y === gridY
    )
      return;

    hoverContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (currentTool === "pen" || currentTool === "eraser") {
      const x = gridX * pixelSize;
      const y = gridY * pixelSize;

      if (currentTool === "pen") {
        hoverContext.strokeStyle = color;
        hoverContext.lineWidth = 2;
        hoverContext.strokeRect(x + 1, y + 1, pixelSize - 2, pixelSize - 2);
      } else {
        hoverContext.fillStyle = "rgba(255, 255, 255, 0.8)";
        hoverContext.fillRect(x, y, pixelSize, pixelSize);
        hoverContext.strokeStyle = "#333";
        hoverContext.lineWidth = 1;
        hoverContext.strokeRect(x + 0.5, y + 0.5, pixelSize - 1, pixelSize - 1);
      }
      lastHoveredPixel.current = { x: gridX, y: gridY };
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
    const hoverContext = hoverCanvasRef.current?.getContext("2d");
    if (hoverContext) {
      hoverContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      lastHoveredPixel.current = null;
    }
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};
