import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { LayerResponse } from './layer.schema';

export interface BoardResponse {
  id: Types.ObjectId;
  projectId: Types.ObjectId;
  sectionIds: Types.ObjectId[];
  name: string;
  type: string;
  layers: LayerResponse[];
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
}

export type BoardDocument = HydratedDocument<Board> & {
  updatedAt: Date;
  createdAt: Date;
};

export const BoardSchema = SchemaFactory.createForClass(Board);
