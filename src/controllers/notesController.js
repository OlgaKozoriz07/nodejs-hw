import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

export const getAllNotes = async (req, res, next) => {
  try {
    //збираємо параметри з query,
    //якшо немає - ставимо за замовчуванням
    const { page = 1, perPage = 10, tag, search } = req.query;
    //перетворюємо page i perPage на числа,
    // бо з req.query приходять як рядки
    const numberPage = Number(page);
    const numberPerPage = Number(perPage);
    // Обчислюємо скільки доків треба пропустити
    // Наприклад
    // page = 2, perPage = 10
    // skip = (2 - 1) * 10 = 10
    const skip = (numberPage - 1) * numberPerPage;

    //базовий запит до колекції
    const notesQuery = Note.find();

    //якшо передали tag тоді додаємо фільтр, це означає
    //знайти тільки ті нотатки, де tag = передане значення
    if (tag) {
      notesQuery.where('tag').equals(tag);
    }
     // якщо передали search, то робимо пошук
    // $regex означає частковий пошук
    // $options: 'i'- ігнорує регістр (hello = Hello)
    if (search) {
      notesQuery.where({
        title: { $regex: search, $options: 'i' },
      });
    }

    //робимо сортування, бо без sort
    //пагінація може бути нестабільна
    notesQuery.sort({ createdAt: -1, _id: -1 });

     // виконуємо два запити паралельно
    // clone() потрібен, бо ми використовуємо один query двічі
    // перший рахує загальну кількість
    // другий отримує конкретну сторінку
    const [totalNotes, notes] = await Promise.all([
      notesQuery.clone().countDocuments(), // скільки всього нотаток під фільтр
      notesQuery.skip(skip).limit(numberPerPage).lean(), // конкретна сторінка
    ]);

    // к-сть сторінок
    const totalPages = Math.ceil(totalNotes / numberPerPage);

    //відправляємо відповідь
    res.status(200).json({
      page: numberPage,
      perPage: numberPerPage,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (error) {
    next(error);
 }
};

export const getNoteById = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findById(noteId);
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
};

export const createNote = async (req, res) => {
  const note = await Note.create(req.body);
  res.status(201).json(note);
};

export const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({ _id: noteId });
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
};

export const updateNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndUpdate(
    { _id: noteId },
    req.body,
    { new: true },
  );
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
};
