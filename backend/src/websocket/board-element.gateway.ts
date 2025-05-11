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
      this.logger.log(`Emitting elementAdded to room ${boardId}`, element);
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
        this.logger.log(`[DeleteElement] Received string ID: ${data}`);
        elementId = data;
      } else if (data?.id) {
        this.logger.log(`[DeleteElement] Received object with ID: ${data.id}`);
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
    data: { id: string; action: 'back' | 'forward' | 'bottom' | 'top' },
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
      if (!data?.action) {
        throw new Error('Action is required');
      }

      await this.boardService.changeElementLayer(
        new Types.ObjectId(boardId),
        data.id,
        data.action,
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
