import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

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
export class BoardGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('BoardGateway');
  private clients: Map<string, { color: string }> = new Map();

  @WebSocketServer() server: Server;

  constructor(private readonly configService: ConfigService) {
    this.logger.log(
      `FRONTEND_URI: ${this.configService.get<string>('FRONTEND_URI')}`,
    );
  }

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
