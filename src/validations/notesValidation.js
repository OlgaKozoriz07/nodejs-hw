// Імпортуємо Joi — бібліотека для валідації
// Segments — щоб сказати celebrate яку частину запиту валідовати (body, params, query)
import { Joi, Segments } from "celebrate";
import { TAGS } from "../constants/tags.js";
import mongoose from "mongoose";


// Кастомний валідатор Mongo ObjectId
// value — значення яке прийшло (noteId)
// helpers — утиліти Joi для повернення помилки
const mongoIdValidator = (value, helpers) => {
  const isValidId = mongoose.isValidObjectId(value);
    // Якщо id валідний → повертаємо значення
  // Якщо ні → повертаємо помилку валідації
  return isValidId ? value : helpers.error("any.custom");
}

// Схема для GET /notes (query параметри)
export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string().valid(...TAGS).optional(),
    // Пошук — може бути пустий рядок
    search: Joi.string().allow(""),
  }),
};

// Схема для noteId в params (наприклад GET /notes/:noteId)
export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
// noteId має бути рядок + проходити кастомну перевірку ObjectId
    noteId: Joi.string().custom(mongoIdValidator).required(),
  }),
};

// Схема створення нотатки (POST /notes)
export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).required().messages({
      'string.empty': '{{#label}} cannot be empty',
      'any.required': '{{#label}} is required',
    }),
    content: Joi.string().allow("").optional(),
    tag: Joi.string().valid(...TAGS).optional(),
  }),
};

// Схема оновлення нотатки (PATCH /notes/:noteId)
export const updateNoteSchema = {
   // Спочатку валідовуємо params (noteId)
  [Segments.PARAMS]: Joi.object({
    // Кастомна перевірка ObjectId
    noteId: Joi.string().custom(mongoIdValidator).required(),
  }),
    // Потім body (поля для оновлення)
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).messages({
      'string.empty': '{{#label}} cannot be empty',
    }),
    content: Joi.string().allow('').messages({
      'string.base': 'Content must be a string',
    }),
    tag: Joi.string().valid(...TAGS),
  }).min(1),// важливо: не дозволяємо порожнє тіло
};

