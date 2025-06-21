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
import { useSocket } from "./useSocket";

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastHoveredPixel = useRef<Point | null>(null);
  const pendingPixels = useRef<Pixel[]>([]);
  const isInitialized = useRef(false);

  const [isConnected, setIsConnected] = useState(false);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [pixelSize] = useState(DEFAULT_PIXEL_SIZE);
  const [currentTool, setCurrentTool] = useState<Tool>(DEFAULT_TOOL);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState<PanOffset>({ x: 0, y: 0 });
  const [lastPanPoint, setLastPanPoint] = useState<Point>({ x: 0, y: 0 });

  const socket = useSocket();

  const drawPixel = useCallback(
    (
      gridX: number,
      gridY: number,
      color: string,
      emitEvent: boolean = true
    ) => {
      if (!contextRef.current) {
        pendingPixels.current.push({ x: gridX, y: gridY, color });
        return;
      }

      const context = contextRef.current;
      const x = gridX * pixelSize;
      const y = gridY * pixelSize;

      context.fillStyle = color;
      context.fillRect(x, y, pixelSize, pixelSize);

      context.strokeStyle = "#e0e0e0";
      context.lineWidth = 1;
      context.strokeRect(x, y, pixelSize, pixelSize);

      if (emitEvent && socket) {
        const pixelData: Pixel = { x: gridX, y: gridY, color: color };
        const drawingData: DrawingData = {
          type: "pixel",
          path: JSON.stringify(pixelData),
          color: color,
          brushSize: pixelSize,
          userId: socket.id!,
          timestamp: Date.now(),
        };
        socket.emit("draw", drawingData);
      }
    },
    [pixelSize, socket]
  );

  const processPendingPixels = useCallback(() => {
    while (pendingPixels.current.length > 0) {
      const pixel = pendingPixels.current.shift()!;
      drawPixel(pixel.x, pixel.y, pixel.color, false);
    }
  }, [drawPixel]);

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
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    };

    const handleDraw = (data: DrawingData) => {
      if (data.type === "pixel" && data.path) {
        const pixelData: Pixel = JSON.parse(data.path);
        drawPixel(pixelData.x, pixelData.y, pixelData.color, false);
      }
    };

    const handleDrawingHistory = (history: DrawingData[]) => {
      console.log("Loading drawing history:", history.length, "pixels");
      history.forEach((data) => {
        if (data.type === "pixel" && data.path) {
          const pixelData: Pixel = JSON.parse(data.path);
          drawPixel(pixelData.x, pixelData.y, pixelData.color, false);
        }
      });
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
  }, [socket, drawPixel, drawGrid]);

  return {
    canvasRef,
    hoverCanvasRef,
    contextRef,
    lastHoveredPixel,
    socketRef: { current: socket },
    isConnected,
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
  };
};
