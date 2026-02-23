import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js'
import { errorHandler } from './middleware/errorHandler.js';
import notesRoutes from './routes/notesRoutes.js';

// визначаємо порт для запуску сервера
// якщо в змінних оточення (process.env.PORT) переданий порт, використовуємо його,
// якщо ні, тоді запускаємо сервер на 3000 за замовчуванням.

const PORT = process.env.PORT ?? 3000;
const app = express();

app.use(logger); // логер першим бачить усі запити
app.use(express.json()); // автоматично парсить (розпаковує) тіло HTTP-запиту,
// якщо воно надійшло у форматі JSON, і додає його у req.body.
app.use(cors()); // Дозволяє запити з будь-яких джерел

app.use(notesRoutes); // підключаємо групу маршрутів для нотаток

app.use(notFoundHandler);// 404 якшо маршрут не знайдено
app.use(errorHandler); // 500 якшо сталася помилка на сервері

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// 1. Logger першим → логуються всі вхідні запити.
// 2. JSON і CORS далі → кожен запит обробляється перед передачею в маршрути.
// 3. Маршрути → відповідають на конкретні запити.
// 4. 404 handler → якщо маршрут не знайдено.
// 5. Error handler → якщо трапилась помилка на будь-якому етапі.
