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
import { HttpStatus } from '@nestjs/common/enums/http-status.enum';

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
    const { boardId } = client.handshake.auth;

    if (!boardId) {
      this.logger.error(`Client ${client.id} connected without boardId`);
      client.disconnect(true);
      return;
    }

    client.data.boardId = boardId;
    client.join(boardId);
  }

  handleDisconnect(client: Socket) {}

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

      if (!elementData?.type) {
        throw new Error('Element type is required');
      }

      const layerNumber = elementData.layerNumber ?? 2;
      const element = await this.boardService.addElement(
        new Types.ObjectId(boardId),
        layerNumber,
        elementData,
      );
      client.to(boardId).emit('elementAdded', element);
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

      if (!updateData?.id) {
        client.to(boardId).emit('custom_error', HttpStatus.NOT_FOUND);
        throw new Error('Element ID is required');
      }

      if (!updateData?.newAttrs) {
        client.to(boardId).emit('custom_error', HttpStatus.BAD_REQUEST);
        throw new Error('Updated attributes are required');
      }

      await this.boardService.updateElement(
        boardId,
        updateData.id,
        updateData.newAttrs,
      );
      client.to(boardId).emit('elementUpdated', updateData);
      return { status: 'success', updateData };
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
      let elementId: string;

      if (typeof data === 'string') {
        elementId = data;
      } else if (data?.id) {
        elementId = data.id;
      } else {
        this.logger.error(`[DeleteElement] Invalid data format:`, data);
        throw new Error('Element ID is required');
      }

      if (!elementId) {
        throw new Error('Element ID is required');
      }

      await this.boardService.removeElement(boardId, elementId);

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
  async handleChangeElementLayer(
    @MessageBody()
    data: {
      id: string;
      prevPosition: { layer: number; index: number };
      newPosition: { layer: number; index: number };
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const boardId = client.data.boardId;
      if (!boardId) {
        throw new Error('Board ID not found in connection');
      }
      if (!data?.id) {
        throw new Error('Element ID is required');
      }
      if (!data?.prevPosition || !data?.newPosition) {
        throw new Error('Both previous and new positions are required');
      }

      await this.boardService.changeElementLayer(
        new Types.ObjectId(boardId),
        data.id,
        data.prevPosition,
        data.newPosition,
      );

      this.server.to(boardId).emit('elementMoved', data);
      return { status: 'success', data };
    } catch (error) {
      this.logger.error(`[MoveElement] Error:`, error);
      return this.handleError(error);
    }
  }

  private handleError(error: Error) {
    return {
      status: 'error',
      statusCode: error['statusCode'] || 500,
      message: error.message,
    };
  }
}
