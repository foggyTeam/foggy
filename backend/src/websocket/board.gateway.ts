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
  boardId: string;
}

interface UserDisconnectedData {
  id: string;
  nickname: string;
  color: string;
  boardId: string;
}

interface UserData {
  id: string;
  nickname: string;
  avatar: string;
  color: string;
  boardId: string;
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
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('BoardGateway');
  private clients: Map<string, UserData> = new Map();

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
      const { id, nickname, avatar, color, boardId } = client.handshake
        .auth as {
        id: string;
        nickname: string;
        avatar: string;
        color: string;
        boardId: string;
      };
      if (!id || !nickname || !color || !boardId) {
        this.logger.error('Invalid client data');
        client.disconnect();
        return;
      }
      const userData: UserData = { id, nickname, avatar, color, boardId };
      this.clients.set(client.id, userData);
      client.join(boardId);
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
          boardId: userData.boardId,
        };
        this.server
          .to(userData.boardId)
          .emit('userDisconnected', userDisconnectedData as any);
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
          boardId: clientData.boardId,
          ...data,
        };
        this.server
          .to(clientData.boardId)
          .except(client.id)
          .emit('cursorMove', cursorMoveData as any);
      } else {
        this.logger.warn(`No client data found for client: ${client.id}`);
      }
    } catch (error) {
      this.logger.error(`Error handling cursor move: ${error.message}`);
    }
  }
}
