import { mdiEraser, mdiHandBackLeft, mdiPencil } from "@mdi/js";
import { Tool, Point } from "@/types/canvas";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/constants/canvas";

export const getToolIcon = (tool: Tool) => {
  const iconMap = {
    pen: mdiPencil,
    eraser: mdiEraser,
    hand: mdiHandBackLeft,
  };
  return iconMap[tool];
};

export const getToolCursor = (tool: Tool): string => {
  const createCursor = (
    path: string,
    x: number,
    y: number,
    rotation: number = 0
  ) =>
    `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'><path d='${path}' fill='black' stroke='white' stroke-width='0.5' transform='rotate(${rotation} 12 12)' /></svg>") ${x} ${y}, auto`;

  switch (tool) {
    case "pen":
      return createCursor(mdiPencil, 4, 28);
    case "eraser":
      return createCursor(mdiEraser, 4, 28);
    case "hand":
      return createCursor(mdiHandBackLeft, 8, 8);
  }
};

export const getToolTitle = (tool: Tool) => {
  switch (tool) {
    case "pen":
      return "Pen";
    case "eraser":
      return "Eraser";
    case "hand":
      return "Hand (Pan)";
  }
};

export const getGridPosition = (
  e: React.MouseEvent<HTMLCanvasElement>,
  panOffset: Point,
  pixelSize: number
): Point => {
  const mouseX = e.clientX - panOffset.x;
  const mouseY = e.clientY - panOffset.y;

  return {
    x: Math.floor(mouseX / pixelSize),
    y: Math.floor(mouseY / pixelSize),
  };
};

export const isWithinCanvas = (
  x: number,
  y: number,
  pixelSize: number
): boolean => {
  return (
    x >= 0 &&
    x < CANVAS_WIDTH / pixelSize &&
    y >= 0 &&
    y < CANVAS_HEIGHT / pixelSize
  );
};

export const constrainPanOffset = (offset: Point): Point => {
  const maxX = 0;
  const minX = window.innerWidth - CANVAS_WIDTH;
  const maxY = 0;
  const minY = window.innerHeight - CANVAS_HEIGHT;

  return {
    x: Math.max(minX, Math.min(maxX, offset.x)),
    y: Math.max(minY, Math.min(maxY, offset.y)),
  };
};
