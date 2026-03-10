import mongoose, { Schema } from "mongoose";
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
    //розширимо схему нотатки,
    // додавши поле userId.
    // Це дозволить зрозуміти,
    // кому саме належить конкретна нотатка
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", //означає, що поле userId посилається на інший документ у колекції users.
      //встановлюємо звязок між колекціями: кожна нотатка належить певному користувачу.
      required: true,
   }
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
