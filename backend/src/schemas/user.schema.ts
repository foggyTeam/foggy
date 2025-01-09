import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

interface UserSettings {
  emailNotifications: boolean;
  projectNotifications: boolean;
  favoriteProjectNotifications: boolean;
}

const defaultSettings: UserSettings = {
  emailNotifications: false,
  projectNotifications: false,
  favoriteProjectNotifications: true,
};

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  nickname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now })
  registrationDate: Date;

  @Prop({ type: Object, default: defaultSettings })
  settings: UserSettings;

  @Prop({ default: '' })
  profileDescription: string;
}

export const UserSchema = SchemaFactory.createForClass(User);