import { Tool } from "@/types/canvas";

export const CANVAS_WIDTH = 3560;
export const CANVAS_HEIGHT = 2000;
export const DEFAULT_PIXEL_SIZE = 20;
export const DEFAULT_COLOR = "#000000";
export const DEFAULT_TOOL: Tool = "pen";

export const ERASER_SIZES = [
  { label: "1x1", width: 1, height: 1 },
  { label: "2x2", width: 2, height: 2 },
  { label: "3x3", width: 3, height: 3 },
  { label: "4x4", width: 4, height: 4 },
  { label: "5x5", width: 5, height: 5 },
] as const;

export const DEFAULT_ERASER_SIZE = ERASER_SIZES[0];
