import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

interface UserSettings {
  emailNotifications: boolean;
  projectNotifications: boolean;
  teamNotifications: boolean;
}

const defaultSettings: UserSettings = {
  emailNotifications: false,
  projectNotifications: false,
  teamNotifications: true,
};

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  nickname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password?: string;

  @Prop({ default: Date.now })
  registrationDate: Date;

  @Prop({ type: Object, default: defaultSettings })
  settings: UserSettings;

  @Prop({ default: '' })
  profileDescription: string;

  @Prop({ default: '' })
  avatar: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
