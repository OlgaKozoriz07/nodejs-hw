import bcrypt from 'bcrypt';
import createHttpError from "http-errors";
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';

export const registerUser = async (req, res) => {
  const { email, password } = req.body;
  //шукаємо користувача з таким email.
  const existingUser = await User.findOne({ email });
  //Якщо існує повертаємо помилку
  // 400 Bad Request з повідомленням
  if (existingUser) {
    throw createHttpError(400, 'Email in use');
  }
  //хешуємо пароль
  const hashedPassword = await bcrypt.hash(password, 10);
  //створюємо користувача
  const newUser = await User.create({
    email,
    password: hashedPassword,
  });

  //створюємо нову сесію
  const newSession = await createSession(newUser._id);
  //сервер відправляє браузеру cookies,
  // щоб браузер автоматично передавав токени у наступних запитах.
  setSessionCookies(res, newSession);

//відправляємо дані користувача(без пароля) у відповідь
  res.status(201).json(newUser);
}

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  //перевіряємо чи існує користувач з такою поштою
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }
  //порівнюємо хеші паролів
  const isValidPassword = await bcrypt.compare(password, user.password);// порівнює введений пароль із хешем у базі.
  if (!isValidPassword) {
    throw createHttpError(401, 'Invalid credentials');
  }

  //видаляємо стару сесію корстувача
  await Session.deleteOne({ userId: user._id });

  //створюємо нову сесію
  const newSession = await createSession(user._id);
  //сервер відправляє браузеру cookies,
  // щоб браузер автоматично передавав токени у наступних запитах.
  setSessionCookies(res, newSession);

  res.status(200).json(user);
}

//реєстрація = створюємо юсера, геренуємо пару токенів і зберігаємо сесію
//логін = перевіряємо облікові дані, прибираємо попередню сесію юсера(якщо була)
//створюємо нову пару токенів і сесію

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;// отримуємо sessionId з cookies
  if (sessionId) {
    //Якщо він є, видаляємо відповідну сесію з бази даних
    await Session.deleteOne({ _id: sessionId });
  }
  //метод res.clearCookie для видалення всіх куків
  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  //204 No Content
  res.status(204).send();
}


export const refreshUserSession = async (req, res) => {
  //Знаходимо поточну сесію за id сесії та рефреш токеном
  const session = await Session.findOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });
  // якшо такої сесії нема, повертаємо помилку
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  //якшо сесія існує, перевіряємо валідність рефреш токена
  //Чи теперішній час більший ніж час закінчення токена?
  //19:00 > 20:00 = false 21:00 > 20:00 = true
  //const isSessionTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);

  const now = new Date();
  const expiresAt = new Date(session.refreshTokenValidUntil);
  const isSessionTokenExpired = now > expiresAt;

  //якшо термін дії рефреш токена вийшов, повертаємо помилку
  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  //якшо всі перевірки пройшли добре видаляємо поточну сесію
  await Session.deleteOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  // створюємо нову сесію та додаємо кукі
  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);
  res.status(200).json({
    message: 'Session refreshed',
  });
};
