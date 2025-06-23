import { useRef, useState, useEffect, useCallback } from "react";
import { Socket } from "socket.io-client";
import { DrawingData } from "@/types/socket";
import { Tool, Pixel, PanOffset, Point } from "@/types/canvas";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DEFAULT_PIXEL_SIZE,
  DEFAULT_COLOR,
  DEFAULT_TOOL,
} from "@/constants/canvas";

export const useCanvas = (socket: Socket | null) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastHoveredPixel = useRef<Point | null>(null);
  const pendingPixels = useRef<Pixel[]>([]);
  const isInitialized = useRef(false);

  const [color, setColor] = useState(DEFAULT_COLOR);
  const [pixelSize] = useState(DEFAULT_PIXEL_SIZE);
  const [currentTool, setCurrentTool] = useState<Tool>(DEFAULT_TOOL);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState<PanOffset>({ x: 0, y: 0 });
  const [lastPanPoint, setLastPanPoint] = useState<Point>({ x: 0, y: 0 });

  type DrawPixel = { x: number; y: number; color: string };
  type ErasePixel = { x: number; y: number };

  const drawPixels = useCallback(
    (pixels: DrawPixel[], emitEvent: boolean = true) => {
      if (!contextRef.current) return;
      const context = contextRef.current;
      pixels.forEach(({ x, y, color }) => {
        context.fillStyle = color;
        context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      });
      if (emitEvent && socket && pixels.length > 0) {
        const drawingData: DrawingData = {
          path: JSON.stringify(pixels),
          color: pixels[0].color,
        };
        socket.emit("draw", drawingData);
      }
    },
    [pixelSize, socket]
  );

  const erasePixels = useCallback(
    (pixels: ErasePixel[], emitEvent: boolean = true) => {
      if (!contextRef.current) return;
      const context = contextRef.current;
      pixels.forEach(({ x, y }) => {
        context.fillStyle = "#ffffff";
        context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        context.strokeStyle = "#e0e0e0";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(x * pixelSize, y * pixelSize);
        context.lineTo(x * pixelSize, (y + 1) * pixelSize);
        context.stroke();
        context.beginPath();
        context.moveTo(x * pixelSize, y * pixelSize);
        context.lineTo((x + 1) * pixelSize, y * pixelSize);
        context.stroke();
      });
      if (emitEvent && socket && pixels.length > 0) {
        const drawingData: DrawingData = {
          path: JSON.stringify(pixels),
          color: "",
        };
        socket.emit("draw", drawingData);
      }
    },
    [pixelSize, socket]
  );

  const processPendingPixels = useCallback(() => {
    while (pendingPixels.current.length > 0) {
      const pixel = pendingPixels.current.shift()!;
      drawPixels([pixel], false);
    }
  }, [drawPixels]);

  const drawGrid = useCallback(() => {
    if (!contextRef.current || !canvasRef.current || isInitialized.current)
      return;

    const context = contextRef.current;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "#e0e0e0";
    context.lineWidth = 1;

    for (let x = 0; x <= width; x += pixelSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    for (let y = 0; y <= height; y += pixelSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(height, y);
      context.stroke();
    }

    processPendingPixels();
    isInitialized.current = true;
  }, [pixelSize, processPendingPixels]);

  const handleDraw = (data: DrawingData) => {
    if (!contextRef.current) return;
    if (data.path && data.color) {
      const pixels: DrawPixel[] = JSON.parse(data.path);
      drawPixels(pixels, false);
    } else if (data.path && !data.color) {
      const erasePixelsArr: ErasePixel[] = JSON.parse(data.path);
      erasePixels(erasePixelsArr, false);
    }
  };

  const handleDrawingHistory = (history: DrawingData[]) => {
    console.log("Loading drawing history:", history.length, "pixels");
    history.forEach((data) => {
      if (data.path && data.color) {
        const pixelData: DrawPixel = {
          ...JSON.parse(data.path),
          color: data.color,
        };
        drawPixels([pixelData], false);
      }
    });
  };

  useEffect(() => {
    setPanOffset({
      x: (window.innerWidth - CANVAS_WIDTH) / 2,
      y: (window.innerHeight - CANVAS_HEIGHT) / 2,
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("Connected to server");
    };

    const handleDisconnect = () => {
      console.log("Disconnected from server");
    };

    const handleClearCanvas = () => {
      drawGrid();
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("draw", handleDraw);
    socket.on("drawing-history", handleDrawingHistory);
    socket.on("clear-canvas", handleClearCanvas);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("draw", handleDraw);
      socket.off("drawing-history", handleDrawingHistory);
      socket.off("clear-canvas", handleClearCanvas);
    };
  }, [socket, drawPixels, erasePixels]);

  return {
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
  };
};
