import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

interface CursorMoveData {
  id: string;
  color: string;
  x: number;
  y: number;
}

interface UserDisconnectedData {
  id: string;
  color: string;
}

@WebSocketGateway({
  cors: {
    origin: ' http://localhost:3000',
    credentials: true,
  },
})
export class BoardGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('BoardGateway');
  private clients: Map<string, { color: string }> = new Map();

  afterInit() {
    this.logger.log('Init');
  }

  handleConnection(client: Socket) {
    const color = this.getRandomColor();
    this.clients.set(client.id, { color });
    this.logger.log(`Client connected: ${client.id} (Color: ${color})`);
  }

  handleDisconnect(client: Socket) {
    const clientData = this.clients.get(client.id);
    if (clientData) {
      const userDisconnectedData: UserDisconnectedData = {
        id: client.id,
        color: clientData.color,
      };
      this.logger.log(
        `Client disconnected: ${client.id} (Color: ${clientData.color})`,
      );
      client.broadcast.emit('userDisconnected', userDisconnectedData as any);
      this.clients.delete(client.id);
    }
  }

  @SubscribeMessage('cursorMove')
  handleCursorMove(
    @MessageBody() data: { x: number; y: number },
    @ConnectedSocket() client: Socket,
  ): void {
    const clientData = this.clients.get(client.id);
    if (clientData) {
      const cursorMoveData: CursorMoveData = {
        id: client.id,
        color: clientData.color,
        ...data,
      };
      this.logger.log(`Cursor move from ${client.id}: ${JSON.stringify(data)}`);
      client.broadcast.emit('cursorMove', cursorMoveData as any);
    }
  }

  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
