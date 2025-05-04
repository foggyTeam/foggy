import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { BoardService } from '../board/board.service';
import { Types } from 'mongoose';
import { UpdateElementDto } from '../board/dto/update-element.dto';

@WebSocketGateway({
  namespace: '/elements',
  cors: {
    origin: (origin, callback) => {
      const allowedOrigin = process.env.FRONTEND_URI;
      if (origin === allowedOrigin || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
})
export class BoardElementsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('BoardElementsGateway');

  constructor(private readonly boardService: BoardService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connecting: ${client.id}`);

    const { boardId } = client.handshake.auth;

    if (!boardId) {
      this.logger.error(`Client ${client.id} connected without boardId`);
      client.disconnect(true);
      return;
    }

    client.data.boardId = boardId;
    client.join(boardId);
    this.logger.log(`Client ${client.id} joined room ${boardId}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected: ${client.id} (board ${client.data.boardId})`,
    );
  }

  @SubscribeMessage('addElement')
  async handleAddElement(
    @MessageBody()
    data: {
      layerNumber?: number;
      elementData: any;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const boardId = client.data.boardId;
      if (!boardId) {
        throw new Error('Board ID not found in connection');
      }

      const element = await this.boardService.addElement(
        new Types.ObjectId(boardId),
        data.layerNumber,
        data.elementData,
      );

      client.to(boardId).emit('elementAdded', { boardId, element });
      return { status: 'success', element };
    } catch (error) {
      this.logger.error(`Error adding element: ${error.message}`);
      return {
        status: 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('updateElement')
  async handleUpdateElement(
    @MessageBody() data: { elementId: string; updateData: UpdateElementDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const boardId = client.data.boardId;
      if (!boardId) {
        throw new Error('Board ID not found in connection');
      }

      const element = await this.boardService.updateElement(
        data.elementId,
        data.updateData,
      );

      client.to(boardId).emit('elementUpdated', {
        elementId: data.elementId,
        element,
      });
      return { status: 'success', element };
    } catch (error) {
      this.logger.error(`Error updating element: ${error.message}`);
      return {
        status: 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('deleteElement')
  async handleDeleteElement(
    @MessageBody() data: { elementId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const boardId = client.data.boardId;
      if (!boardId) {
        throw new Error('Board ID not found in connection');
      }

      await this.boardService.removeElement(data.elementId);
      client.to(boardId).emit('elementDeleted', { elementId: data.elementId });
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Error deleting element: ${error.message}`);
      return {
        status: 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('moveElement')
  async handleMoveElement(
    @MessageBody()
    data: { elementId: string; direction: 'up' | 'down'; withinLayer: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const boardId = client.data.boardId;
      if (!boardId) {
        throw new Error('Board ID not found in connection');
      }

      let element;
      if (data.withinLayer) {
        element = await this.boardService.moveElementWithinLayer(
          data.elementId,
          data.direction,
        );
      } else {
        const board = await this.findBoardContainingElement(data.elementId);
        element = await this.boardService.moveElementToLayer(
          board._id,
          data.elementId,
          data.direction,
        );
      }

      client.to(boardId).emit('elementMoved', {
        elementId: data.elementId,
        element,
      });
      return { status: 'success', element };
    } catch (error) {
      this.logger.error(`Error moving element: ${error.message}`);
      return {
        status: 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
      };
    }
  }

  private async findBoardContainingElement(elementId: string): Promise<any> {
    const boards = await this.boardService.findAll();

    for (const board of boards) {
      try {
        await this.boardService.getElementLayerIndex(board.layers, elementId);
        return board;
      } catch (error) {
        this.logger.log(error);
        continue;
      }
    }

    throw new Error(`Element with ID ${elementId} not found in any board`);
  }
}
