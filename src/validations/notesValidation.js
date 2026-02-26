import { Joi, Segments } from "celebrate";
import { TAGS } from "../constants/tags";
import mongoose from "mongoose";

const mongoIdValidator = (value, helpers) => {
  const isValidId = mongoose.isValidObjectId(value);
  return isValidId ? value : helpers.error("Invalid ObjectId");
}


export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string().valid(...TAGS).optional(),
    search: Joi.string().allow(""),
  }),
};

export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(mongoIdValidator).required(),
  }),
};


export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().max(500).allow("").optional(),
    tag: Joi.string().valid(...TAGS).optional(),
  }),
};


export const updateNoteSchema = {
    [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(mongoIdValidator).required(),
    }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).messages({
      'string.empty': ''
    })
  })
}

