import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseElement, BaseElementSchema } from './element.schema';

@Schema()
export class Layer extends Document {
  @Prop({ required: true })
  boardId: string;

  @Prop({ required: true })
  layerNumber: number;

  @Prop({
    type: [BaseElementSchema],
    default: [],
  })
  elements: Array<Types.Subdocument & BaseElement>;
}

export const LayerSchema = SchemaFactory.createForClass(Layer);
