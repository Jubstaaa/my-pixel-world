import { useEffect, useRef, useCallback } from "react";
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
  drawPixels: (
    pixels: { x: number; y: number; color: string }[],
    emitEvent?: boolean
  ) => void;
  erasePixels: (
    pixels: { x: number; y: number }[],
    emitEvent?: boolean
  ) => void;
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
  drawPixels,
  erasePixels,
  drawGrid,
}: UseCanvasEventsProps) => {
  const drawGridRef = useRef(drawGrid);
  drawGridRef.current = drawGrid;

  const isDrawing = useRef(false);
  const lastDrawTime = useRef(0);
  const drawPath = useRef<Point[]>([]);
  const throttleDelay = 16;
  const drawDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const eraseDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const pendingPixels = useRef<{ x: number; y: number; color: string }[]>([]);
  const pendingErasePixels = useRef<Point[]>([]);

  const debouncedSendDraw = useCallback(() => {
    if (drawDebounceTimeout.current) {
      clearTimeout(drawDebounceTimeout.current);
    }
    drawDebounceTimeout.current = setTimeout(() => {
      if (pendingPixels.current.length > 0) {
        const pixels = pendingPixels.current.map((point) => ({
          x: point.x,
          y: point.y,
          color: color,
        }));
        drawPixels(pixels, true);
        pendingPixels.current = [];
      }
    }, 100);
  }, [color, drawPixels]);

  const debouncedSendErase = useCallback(() => {
    if (eraseDebounceTimeout.current) {
      clearTimeout(eraseDebounceTimeout.current);
    }
    eraseDebounceTimeout.current = setTimeout(() => {
      if (pendingErasePixels.current.length > 0) {
        const pixels = pendingErasePixels.current.map((point) => ({
          x: point.x,
          y: point.y,
        }));
        erasePixels(pixels, true);
        pendingErasePixels.current = [];
      }
    }, 100);
  }, [erasePixels]);

  const throttledDraw = useCallback(
    (x: number, y: number, shouldEmit: boolean = false) => {
      const now = Date.now();
      if (shouldEmit || now - lastDrawTime.current >= throttleDelay) {
        if (currentTool === "eraser") {
          erasePixels([{ x, y }], shouldEmit);
          if (!shouldEmit) {
            pendingErasePixels.current.push({ x, y });
            debouncedSendErase();
          }
        } else {
          drawPixels([{ x, y, color }], shouldEmit);
          if (!shouldEmit) {
            pendingPixels.current.push({ x, y, color });
            debouncedSendDraw();
          }
        }
        if (shouldEmit) {
          drawPath.current.push({ x, y });
        }
        lastDrawTime.current = now;
      }
    },
    [
      currentTool,
      color,
      drawPixels,
      erasePixels,
      debouncedSendDraw,
      debouncedSendErase,
    ]
  );

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

    return () => {
      if (drawDebounceTimeout.current) {
        clearTimeout(drawDebounceTimeout.current);
      }
      if (eraseDebounceTimeout.current) {
        clearTimeout(eraseDebounceTimeout.current);
      }
    };
  }, [canvasRef, hoverCanvasRef, contextRef]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === "hand") {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else {
      isDrawing.current = true;
      drawPath.current = [];

      const { x, y } = getGridPosition(e, panOffset, pixelSize);
      if (isWithinCanvas(x, y, pixelSize)) {
        if (currentTool === "eraser") {
          erasePixels([{ x, y }], true);
        } else {
          drawPixels([{ x, y, color }], true);
        }
        drawPath.current.push({ x, y });
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
    } else if (e.buttons === 1 && currentTool !== "hand" && isDrawing.current) {
      const { x, y } = getGridPosition(e, panOffset, pixelSize);
      if (isWithinCanvas(x, y, pixelSize)) {
        throttledDraw(x, y, false);
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

    if (currentTool === "pen") {
      const x = gridX * pixelSize;
      const y = gridY * pixelSize;

      hoverContext.strokeStyle = color;
      hoverContext.lineWidth = 2;
      hoverContext.strokeRect(x + 1, y + 1, pixelSize - 2, pixelSize - 2);
      lastHoveredPixel.current = { x: gridX, y: gridY };
    } else if (currentTool === "eraser") {
      const x = gridX * pixelSize;
      const y = gridY * pixelSize;

      hoverContext.fillStyle = "rgba(255, 255, 255, 0.8)";
      hoverContext.fillRect(x, y, pixelSize, pixelSize);
      hoverContext.strokeStyle = "#333";
      hoverContext.lineWidth = 1;
      hoverContext.strokeRect(x + 0.5, y + 0.5, pixelSize - 1, pixelSize - 1);
      lastHoveredPixel.current = { x: gridX, y: gridY };
    }
  };

  const handleMouseUp = () => {
    if (isDrawing.current && currentTool !== "hand") {
      if (currentTool === "eraser") {
        debouncedSendErase();
      } else {
        debouncedSendDraw();
      }
    }

    isDrawing.current = false;
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    if (isDrawing.current && currentTool !== "hand") {
      if (currentTool === "eraser") {
        debouncedSendErase();
      } else {
        debouncedSendDraw();
      }
    }

    isDrawing.current = false;
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
