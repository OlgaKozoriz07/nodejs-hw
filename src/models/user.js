import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
  },
  {
    timestamps: true,
  },
);

//pre-hook Schema.pre("save"),
// який виконується перед збереженням користувача
//ми використовуємо this (посилання на поточний документ),
//  функція не може бути стрілковою
userSchema.pre('save', function () {
  if (!this.username) {
    this.username = this.email;
  }
});

//Пароль ми можемо видаляти його автоматично з будь-якої відповіді,
// перевизначивши метод toJSON().
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model("User", userSchema);
