import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  sendNotification(recipientId: string, notification: any): void {
    this.logger.log(`Sending real-time notification to ${recipientId}`);
    this.server.to(recipientId).emit('notification', notification);
  }

  sendBroadcast(notification: any): void {
    this.logger.log('Sending broadcast notification');
    this.server.emit('notification', notification);
  }
}


