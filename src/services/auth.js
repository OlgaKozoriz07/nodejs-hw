// створюємо сесію. тут генеруємо пару токенів і строки їх дії

import crypto from 'crypto';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';
import { Session } from '../models/session.js';

export const createSession = async (userId) => {
  //згенеруй 30 байтів випадкових даних
  //base64 — це спосіб перетворити байти у текстовий рядок
  //тобто ми генеруємо 2 випадкових набори даних,
  //а потім перетворємо його у текст аби можна було норм використовувати
  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');

  return Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
}

export const setSessionCookies = (res, session) => {
  //токен до 15хв
  res.cookie('accessToken', session.accessToken, {
    httpOnly: true,//зменшує ризик витоку токені через XSS(кібератака)
    secure: true,//браузер надсилає куку лише через HTTPS
    sameSite: 'none',// дозволяє кукі подорожувати між сайтами(коли фронт і бек на різних доменах\порталах)
    maxAge: FIFTEEN_MINUTES,
  });
  //токен для оновлення пари токенів до 1 дня
  res.cookie('refreshToken', session.refreshToken,
    {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ONE_DAY,
    });
  //ідентифікатор поточної сесії до 1 дня
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: ONE_DAY,
  });
};
