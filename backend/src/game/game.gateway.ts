import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected', client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; player: string },
  ) {
    client.join(data.roomId);
    this.server.to(data.roomId).emit('playerJoined', { player: data.player });
  }

  @SubscribeMessage('makeMove')
  handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; move: number; player: string },
  ) {
    // emit to room so everyone gets the move
    this.server.to(data.roomId).emit('moveMade', data);
  }
}
