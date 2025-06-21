export type Tool = "pen" | "eraser" | "hand";

export interface Pixel {
  x: number;
  y: number;
  color: string;
}

export interface Point {
  x: number;
  y: number;
}

export type PanOffset = Point;
