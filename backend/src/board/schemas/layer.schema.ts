import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseElement, BaseElementSchema } from './element.schema';

export interface LayerResponse {
  layerNumber: number;
  elements: Array<Types.Subdocument & BaseElement>;
}

@Schema()
export class Layer {
  @Prop({ required: true })
  boardId: Types.ObjectId;

  @Prop({ required: true })
  layerNumber: number;

  @Prop({ type: [BaseElementSchema], default: [] })
  elements: Array<Types.Subdocument & BaseElement>;
}

export type LayerDocument = HydratedDocument<Layer>;

export const LayerSchema = SchemaFactory.createForClass(Layer);
