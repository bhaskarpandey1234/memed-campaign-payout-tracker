import { Schema, model } from 'mongoose';

export const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['brand', 'creator'], required: true },
  },
  { timestamps: true },
);

export const User = model('User', userSchema);
