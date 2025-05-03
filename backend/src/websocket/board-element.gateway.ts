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
import { CreateElementDto } from '../board/dto/create-element.dto';

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
    this.logger.log(`Client connected to elements namespace: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected from elements namespace: ${client.id}`,
    );
  }

  @SubscribeMessage('addElement')
  async handleAddElement(
    @MessageBody()
    data: {
      boardId: string;
      layerNumber?: number;
      elementData: CreateElementDto;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const boardId = new Types.ObjectId(data.boardId);
      const element = await this.boardService.addElement(
        boardId,
        data.layerNumber,
        data.elementData,
      );

      client.broadcast.emit('elementAdded', { boardId: data.boardId, element });
      return { status: 'success', element };
    } catch (error) {
      this.logger.error(`Error adding element: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('updateElement')
  async handleUpdateElement(
    @MessageBody() data: { elementId: string; updateData: UpdateElementDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const element = await this.boardService.updateElement(
        data.elementId,
        data.updateData,
      );

      this.server.emit('elementUpdated', {
        elementId: data.elementId,
        element,
      });
      return { status: 'success', element };
    } catch (error) {
      this.logger.error(`Error updating element: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('deleteElement')
  async handleDeleteElement(
    @MessageBody() data: { elementId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.boardService.removeElement(data.elementId);

      this.server.emit('elementDeleted', { elementId: data.elementId });
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Error deleting element: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('moveElement')
  async handleMoveElement(
    @MessageBody()
    data: { elementId: string; direction: 'up' | 'down'; withinLayer: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      let element;
      if (data.withinLayer) {
        element = await this.boardService.moveElementWithinLayer(
          data.elementId,
          data.direction,
        );
      } else {
        // For moving between layers, we'll use the public getElementLayerIndex method
        const board = await this.findBoardContainingElement(data.elementId);
        element = await this.boardService.moveElementToLayer(
          board._id,
          data.elementId,
          data.direction,
        );
      }

      this.server.emit('elementMoved', { elementId: data.elementId, element });
      return { status: 'success', element };
    } catch (error) {
      this.logger.error(`Error moving element: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  private async findBoardContainingElement(elementId: string): Promise<any> {
    // This is a fallback method that uses only public methods
    // Note: This might be inefficient for large numbers of boards
    // In production, you might want to add a public method to BoardService for this

    // First get all boards (you might want to add pagination in production)
    const boards = await this.boardService.findAll();

    // Check each board's layers for the element
    for (const board of boards) {
      try {
        await this.boardService.getElementLayerIndex(board.layers, elementId);
        return board; // If we get here, the element was found in this board
      } catch (error) {
        // Element not found in this board, continue searching
        continue;
      }
    }

    throw new Error(`Element with ID ${elementId} not found in any board`);
  }
}
