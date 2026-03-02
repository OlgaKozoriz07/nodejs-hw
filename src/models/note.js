import mongoose from "mongoose";
import { TAGS } from "../constants/tags.js";


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
      enum: TAGS,
    },
  },
  {
    timestamps: true,
  }
);

// Додаємо текстовий індекс: кажемо MongoDB,
//  що по полю title i content можна робити $text
noteSchema.index({ title: "text", content: "text" });

// Створюємо модель "Note" на основі схеми noteSchema
export const Note = mongoose.model("Note", noteSchema);
