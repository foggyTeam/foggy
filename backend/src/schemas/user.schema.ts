import { Schema, Document } from 'mongoose';

export const UserSchema = new Schema({
  nickname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export interface User extends Document {
  nickname: string;
  email: string;
  password: string;
}
