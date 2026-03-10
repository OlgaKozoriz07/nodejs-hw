import createHttpError from "http-errors";
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  //перевіряємо наявність accessToken
  //якшо немає відмовляємо у доступі
  if (!req.cookies.accessToken) {
    throw createHttpError(401, 'Missing access token');
  }
  //якщо accessToken існує, то шукаємо сесію
  const session = await Session.findOne({
    accessToken: req.cookies.accessToken,
  });
  //якщо такої сесії нема, повертаємо помилку
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  //перевіряємо термін дії аксес токена
  const isAccessTokenExpired = new Date() > new Date(session.accessTokenValidUntil);
  if (isAccessTokenExpired) {
    throw createHttpError(401, 'Access token expired');
  }
  //якшо з токеном все ок і сесія існує
  //шукаємо користувача
  const user = await User.findById(session.userId);
  //якшо користувача не знайдено
  if (!user) {
    throw createHttpError(401);
  }
  //якшо користувач інсує додаємо його до запиту
  req.user = user;
  //передаємо управління далі
  next();
};

