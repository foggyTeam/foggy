import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { Board, BoardSchema } from './schemas/board.schema';
import { Layer, LayerSchema } from './schemas/layer.schema';
import {
  EllipseElement,
  EllipseElementSchema,
  LineElement,
  LineElementSchema,
  MarkerElement,
  MarkerElementSchema,
  RectElement,
  RectElementSchema,
  TextElement,
  TextElementSchema,
} from './schemas/element.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Board.name, schema: BoardSchema },
      { name: Layer.name, schema: LayerSchema },
      { name: RectElement.name, schema: RectElementSchema },
      { name: EllipseElement.name, schema: EllipseElementSchema },
      { name: TextElement.name, schema: TextElementSchema },
      { name: LineElement.name, schema: LineElementSchema },
      { name: MarkerElement.name, schema: MarkerElementSchema },
    ]),
  ],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
