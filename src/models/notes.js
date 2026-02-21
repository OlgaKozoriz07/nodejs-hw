import mongoose from "mongoose";
import { model } from "mongoose";

const noteSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
      trim: true,
    },
    tag: {
      type: String,
      default: "Todo",
      enum: ['Work', 'Personal', 'Todo', 'Meeting', 'Shopping', 'Ideas', 'Other'],
    },
  },
  {
    timestamps: true,
  }
);

// Створюємо модель "Note" на основі схеми noteSchema
export const Note = model("Note", noteSchema);
