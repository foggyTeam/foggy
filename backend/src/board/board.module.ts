import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { BoardElementsGateway } from '../websocket/board-element.gateway';
import { Board, BoardSchema } from './schemas/board.schema';
import { Layer, LayerSchema } from './schemas/layer.schema';
import { ProjectModule } from '../projects/projects.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Board.name, schema: BoardSchema },
      { name: Layer.name, schema: LayerSchema },
    ]),
    forwardRef(() => ProjectModule),
  ],
  controllers: [BoardController],
  providers: [BoardService, BoardElementsGateway],
  exports: [BoardService, MongooseModule],
})
export class BoardModule {}
