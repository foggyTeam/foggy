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
    @MessageBody() elementData: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const boardId = client.data.boardId;
      if (!boardId) {
        throw new Error('Board ID not found in connection');
      }

      this.logger.log(`[AddElement] Received:`, elementData);

      if (!elementData?.type) {
        throw new Error('Element type is required');
      }

      const layerNumber = elementData.layerNumber ?? 2;
      const element = await this.boardService.addElement(
        new Types.ObjectId(boardId),
        layerNumber,
        elementData,
      );

      client.to(boardId).emit('elementAdded', { boardId, element });
      return { status: 'success', element };
    } catch (error) {
      this.logger.error(`[AddElement] Error:`, error);
      return this.handleError(error);
    }
  }

  @SubscribeMessage('updateElement')
  async handleUpdateElement(
    @MessageBody()
    updateData: { id: string; newAttrs: Partial<UpdateElementDto> },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const boardId = client.data.boardId;
      if (!boardId) {
        throw new Error('Board ID not found in connection');
      }

      this.logger.log(`[UpdateElement] Received:`, updateData);

      if (!updateData?.id) {
        throw new Error('Element ID is required');
      }

      if (!updateData?.newAttrs) {
        throw new Error('Updated attributes are required');
      }

      const element = await this.boardService.updateElement(
        updateData.id,
        updateData.newAttrs,
      );

      client.to(boardId).emit('elementUpdated', {
        elementId: updateData.id,
        element,
      });
      return { status: 'success', element };
    } catch (error) {
      this.logger.error(`[UpdateElement] Error:`, error);
      return this.handleError(error);
    }
  }

  @SubscribeMessage('removeElement')
  async handleDeleteElement(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const boardId = client.data.boardId;
      if (!boardId) {
        throw new Error('Board ID not found in connection');
      }

      this.logger.log(`[DeleteElement] Raw received data:`, data);
      this.logger.log(`[DeleteElement] Type of data: ${typeof data}`);

      let elementId: string;

      if (typeof data === 'string') {
        this.logger.log(`[DeleteElement] Received string ID: ${data}`);
        elementId = data;
      } else if (data?.id) {
        this.logger.log(`[DeleteElement] Received object with ID: ${data.id}`);
        elementId = data.id;
      } else {
        this.logger.error(`[DeleteElement] Invalid data format:`, data);
        throw new Error('Element ID is required');
      }

      this.logger.log(`[DeleteElement] Processing ID: ${elementId}`);

      if (!elementId) {
        throw new Error('Element ID is required');
      }

      await this.boardService.removeElement(elementId);

      // Отправляем в формате, ожидаемом фронтендом (просто ID)
      client.to(boardId).emit('elementRemoved', elementId);
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`[DeleteElement] Detailed error:`, {
        message: error.message,
        stack: error.stack,
        receivedData: data,
        connectionData: {
          clientId: client.id,
          boardId: client.data.boardId,
        },
      });
      return this.handleError(error);
    }
  }

  @SubscribeMessage('changeElementLayer')
  async handleMoveElement(
    @MessageBody()
    moveData: { id: string; direction: 'up' | 'down'; withinLayer?: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const boardId = client.data.boardId;
      if (!boardId) {
        throw new Error('Board ID not found in connection');
      }

      this.logger.log(`[MoveElement] Received:`, moveData);

      if (!moveData?.id) {
        throw new Error('Element ID is required');
      }

      let element;
      if (moveData.withinLayer) {
        element = await this.boardService.moveElementWithinLayer(
          moveData.id,
          moveData.direction,
        );
      } else {
        const board = await this.findBoardContainingElement(moveData.id);
        element = await this.boardService.moveElementToLayer(
          board._id,
          moveData.id,
          moveData.direction,
        );
      }

      const actionMap = {
        up: 'forward',
        down: 'back',
      };
      const action = actionMap[moveData.direction] || moveData.direction;

      client.to(boardId).emit('elementMoved', {
        id: moveData.id,
        action,
      });

      return { status: 'success', element };
    } catch (error) {
      this.logger.error(`[MoveElement] Error:`, error);
      return this.handleError(error);
    }
  }

  private async findBoardContainingElement(elementId: string): Promise<any> {
    const boards = await this.boardService.findAll();

    for (const board of boards) {
      try {
        await this.boardService.getElementLayerIndex(board.layers, elementId);
        return board;
      } catch (error) {
        continue;
      }
    }

    throw new Error(`Element with ID ${elementId} not found in any board`);
  }

  private handleError(error: Error) {
    return {
      status: 'error',
      statusCode: error['statusCode'] || 500,
      message: error.message,
    };
  }
}
