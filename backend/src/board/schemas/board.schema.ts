import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { BaseElement } from './element.schema';

export interface BoardResponse {
  id: Types.ObjectId;
  projectId: Types.ObjectId;
  sectionIds: Types.ObjectId[];
  name: string;
  type: string;
  layers: Array<Array<Types.Subdocument & BaseElement>>;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Board {
  @Prop({ required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  sectionId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true, ref: 'Layer' })
  layers: Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  nodes?: any[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  edges?: any[];

  @Prop()
  document?: string;
}

export type BoardDocument = HydratedDocument<Board> & {
  updatedAt: Date;
  createdAt: Date;
};

export const BoardSchema = SchemaFactory.createForClass(Board);
