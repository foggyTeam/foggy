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
  nickname: string;
  avatar: string;
  color: string;
  x: number;
  y: number;
}

interface UserDisconnectedData {
  id: string;
  nickname: string;
  color: string;
}

interface UserData {
  id: string;
  nickname: string;
  avatar: string;
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
  private clients: Map<string, UserData> = new Map();

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
    try {
      const { id, nickname, avatar, color } = client.handshake.query as {
        id: string;
        nickname: string;
        avatar: string;
        color: string;
      };

      if (!id || !nickname || !color) {
        this.logger.error('Invalid client data');
        client.disconnect();
        return;
      }

      const userData: UserData = { id, nickname, avatar, color };
      this.clients.set(client.id, userData);
      this.logger.log(
        `Client connected: ${client.id} (User: ${userData.id} ${userData.nickname}, Color: ${userData.color})`,
      );
    } catch (error) {
      this.logger.error(`Error handling connection: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const userData = this.clients.get(client.id);
      if (userData) {
        const userDisconnectedData: UserDisconnectedData = {
          id: userData.id,
          nickname: userData.nickname,
          color: userData.color,
        };
        this.logger.log(
          `Client disconnected: ${client.id} (User: ${userData.id} ${userData.nickname}, Color: ${userData.color})`,
        );
        client.broadcast.emit('userDisconnected', userDisconnectedData as any);
        this.clients.delete(client.id);
      } else {
        this.logger.warn(`No user data found for client: ${client.id}`);
      }
    } catch (error) {
      this.logger.error(`Error handling disconnect: ${error.message}`);
    }
  }

  @SubscribeMessage('cursorMove')
  handleCursorMove(
    @MessageBody() data: { x: number; y: number },
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const clientData = this.clients.get(client.id);
      if (clientData) {
        const cursorMoveData: CursorMoveData = {
          id: clientData.id,
          nickname: clientData.nickname,
          avatar: clientData.avatar,
          color: clientData.color,
          ...data,
        };
        client.broadcast.emit('cursorMove', cursorMoveData as any);
      } else {
        this.logger.warn(`No client data found for client: ${client.id}`);
      }
    } catch (error) {
      this.logger.error(`Error handling cursor move: ${error.message}`);
    }
  }
}
