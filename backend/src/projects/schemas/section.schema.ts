import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export interface PopulatedSectionItem {
  type: 'board' | 'section';
  itemId: {
    _id: Types.ObjectId;
    name: string;
    updatedAt: Date;
  };
}

interface SectionItem {
  type: 'board' | 'section';
  itemId: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Section {
  @Prop({ required: true })
  name: string;

  @Prop({ default: null, type: Types.ObjectId, ref: 'Section' })
  parent?: Types.ObjectId;

  @Prop({
    type: [
      {
        type: { type: String, required: true, enum: ['board', 'section'] },
        itemId: { type: Types.ObjectId, required: true, refPath: 'items.type' },
      },
    ],
    default: [],
  })
  items: SectionItem[];
}

export type SectionDocument = HydratedDocument<Section>;
export const SectionSchema = SchemaFactory.createForClass(Section);
