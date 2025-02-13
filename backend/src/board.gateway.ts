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
import { Server, Socket } from 'socket.io';

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

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('cursorMove')
  handleCursorMove(
    @MessageBody() data: { x: number; y: number },
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(`Cursor move from ${client.id}: ${JSON.stringify(data)}`);
    client.broadcast.emit('cursorMove', { id: client.id, ...data } as any);
  }
}
