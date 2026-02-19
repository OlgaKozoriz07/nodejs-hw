import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import 'dotenv/config';

// визначаємо порт для запуску сервера
// якщо в змінних оточення (process.env.PORT) переданий порт, використовуємо його,
// якщо ні, тоді запускаємо сервер на 3000 за замовчуванням.
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json()); // автоматично парсить (розпаковує) тіло HTTP-запиту,
// якщо воно надійшло у форматі JSON, і додає його у req.body.

app.use(cors()); // Дозволяє запити з будь-яких джерел
app.use(
  pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat: '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
        hideObject: true,
      },
    },
  }),
);

app.get('/notes', (req, res) => {
  res.status(200).json({ message: 'Retrieved all notes' });
});

app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;
  res.status(200).json({ message: `Retrieved note with ID: ${noteId}` });
});

app.get('/test-error', (req, res) => {
  throw new Error('Simulated server error');
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
