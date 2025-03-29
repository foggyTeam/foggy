import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model } from 'mongoose';

@Schema({ discriminatorKey: 'elementType' })
export class BaseElement extends Document {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  draggable: boolean;

  @Prop({ required: true })
  dragDistance: number;

  @Prop({ required: true })
  x: number;

  @Prop({ required: true })
  y: number;

  @Prop({ required: true })
  rotation: number;

  @Prop({ required: true })
  fill: string;

  @Prop({ required: true })
  stroke: string;

  @Prop({ required: true })
  strokeWidth: number;
}

export const BaseElementSchema = SchemaFactory.createForClass(BaseElement);

@Schema()
class RectElement extends BaseElement {
  @Prop({ required: true })
  cornerRadius: number;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;
}

export const RectElementSchema = SchemaFactory.createForClass(RectElement);

@Schema()
class EllipseElement extends BaseElement {
  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;
}

export const EllipseElementSchema =
  SchemaFactory.createForClass(EllipseElement);

@Schema()
class TextElement extends BaseElement {
  @Prop({ required: true })
  svg: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;
}

export const TextElementSchema = SchemaFactory.createForClass(TextElement);

@Schema()
class LineElement extends BaseElement {
  @Prop({ required: true })
  points: number[];

  @Prop({ required: true })
  width: number;
}

export const LineElementSchema = SchemaFactory.createForClass(LineElement);

@Schema()
class MarkerElement extends BaseElement {
  @Prop({ required: true })
  points: number[];

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  opacity: number;
}

export const MarkerElementSchema = SchemaFactory.createForClass(MarkerElement);

export { RectElement, EllipseElement, TextElement, LineElement, MarkerElement };

export const BaseElementModel = model('BaseElement', BaseElementSchema);
BaseElementModel.discriminator('rect', RectElementSchema);
BaseElementModel.discriminator('ellipse', EllipseElementSchema);
BaseElementModel.discriminator('text', TextElementSchema);
BaseElementModel.discriminator('line', LineElementSchema);
BaseElementModel.discriminator('marker', MarkerElementSchema);
