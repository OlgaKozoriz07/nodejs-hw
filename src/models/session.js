import mongoose, { Schema } from "mongoose";

const sessionSchema = mongoose.Schema(
  {
    userId: {//власник сесії
      type: Schema.Types.ObjectId,
      ref: 'User', //посилання на модель User
      required: true,
    },
    accessToken: { // токен до 15хв
      type: String,
      required: true,
    },
    refreshToken: {//токен до 1 дня, зоб оновити пару токенів
      type: String,
      required: true,
    },
    accessTokenValidUntil: {//коли accessToken спливає
      type: Date,
      required: true,
    },
    refreshTokenValidUntil: {//коли refreshToken спливає
      type: Date,
      required: true,
    }
  },
  { timestamps: true },
);

export const Session = mongoose.model('Session', sessionSchema);
