export interface Pixel {
  x: number;
  y: number;
  color: string;
}

export type Tool = "pen" | "eraser" | "hand";

export interface PanOffset {
  x: number;
  y: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface EraserSize {
  label: string;
  width: number;
  height: number;
}
