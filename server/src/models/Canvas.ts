import mongoose, { Schema, Document } from "mongoose";

export interface IPixel {
  x: number;
  y: number;
  color: string;
}

export interface ICanvas extends Document {
  pixels: IPixel[];
  lastUpdated: Date;
}

const CanvasSchema: Schema = new Schema(
  {
    pixels: [
      {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        color: { type: String, required: true },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

CanvasSchema.index({ _id: 1 });

export const Canvas = mongoose.model<ICanvas>("Canvas", CanvasSchema);
