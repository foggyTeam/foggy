import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Counter extends Document {
  @Prop({ type: Number, default: 0 })
  count: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
