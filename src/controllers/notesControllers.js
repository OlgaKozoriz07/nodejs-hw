import { Note } from '../models/notes.js';
import createHttpError from 'http-errors';

export const getNotes = async (req, res) => {
  const notes = await Note.find();
  res.status(200).json(notes);
};

export const getNoteById = async (req, res) => {
  const { noteId } = req.params;
  const notes = await Note.findById(noteId);
  if (!notes) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(notes);
};

