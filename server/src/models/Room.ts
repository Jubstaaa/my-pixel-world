import mongoose, { Schema, Document } from "mongoose";

export interface IPixel {
  x: number;
  y: number;
  color: string;
}

export interface IRoom extends Document {
  slug: string;
  pixels: IPixel[];
  updatedAt: Date;
  createdAt: Date;
}

const RoomSchema: Schema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    pixels: [
      {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        color: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Room = mongoose.model<IRoom>("Room", RoomSchema);
