import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Board extends Document {
  @Prop({ required: true })
  projectId: string;

  @Prop({ required: true })
  section: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true, type: [String] })
  layers: string[];

  @Prop({ required: true, default: Date.now })
  lastChange: Date;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
