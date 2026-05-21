import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import { RoomsService } from '../rooms/rooms.service';
import { MessagesService } from '../messages/messages.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Mapa para realizar un seguimiento de los usuarios en línea por socket ID
  private connectedUsers = new Map<string, { id: number; username: string }>();

  constructor(
    private readonly usersService: UsersService,
    private readonly roomsService: RoomsService,
    private readonly messagesService: MessagesService,
  ) {}

  async handleConnection(client: Socket) {
    const usernameParam = client.handshake.query.username || client.handshake.auth.username;

    if (usernameParam && typeof usernameParam === 'string') {
      try {
        const user = await this.usersService.findOrCreate(usernameParam);
        client.data.user = user;
        this.connectedUsers.set(client.id, user);
        
        // Notificar el estado actual de los usuarios conectados a todos
        this.broadcastUsersStatus();
        console.log(`Cliente conectado y registrado: ${user.username} (${client.id})`);
      } catch (error) {
        console.error(`Error al registrar usuario en la conexión:`, error);
        client.disconnect();
      }
    } else {
      console.log(`Cliente conectado sin identificar: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    if (this.connectedUsers.has(client.id)) {
      const user = this.connectedUsers.get(client.id);
      this.connectedUsers.delete(client.id);
      this.broadcastUsersStatus();
      console.log(`Cliente desconectado: ${user?.username} (${client.id})`);
    } else {
      console.log(`Cliente desconectado (sin identificar): ${client.id}`);
    }
  }

  @SubscribeMessage('register')
  async handleRegister(
    @MessageBody() data: { username: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.username || typeof data.username !== 'string') {
      client.emit('error', { message: 'El nombre de usuario es inválido o está vacío' });
      return;
    }

    try {
      const user = await this.usersService.findOrCreate(data.username);
      client.data.user = user;
      this.connectedUsers.set(client.id, user);
      
      this.broadcastUsersStatus();
      client.emit('registered', user);
      console.log(`Cliente registrado a través del evento "register": ${user.username} (${client.id})`);
    } catch (error) {
      console.error(`Error al registrar en el evento "register":`, error);
      client.emit('error', { message: 'Error al procesar el registro de usuario' });
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      client.emit('error', { message: 'Debe identificarse antes de unirse a una sala' });
      return;
    }

    const roomId = Number(data.roomId);
    if (isNaN(roomId)) {
      client.emit('error', { message: 'ID de sala inválido' });
      return;
    }

    try {
      // Verificar que la sala exista
      await this.roomsService.findOne(roomId);
      
      const roomName = `room-${roomId}`;
      await client.join(roomName);

      // Obtener el historial de mensajes de la sala
      const messages = await this.roomsService.getMessages(roomId);
      
      // Enviar el historial de mensajes al usuario que se conecta
      client.emit('room_history', { roomId, messages });

      // Notificar a los demás en la sala que se ha unido
      client.to(roomName).emit('user_joined', { roomId, user });
      console.log(`Usuario ${user.username} se unió a la sala ${roomId}`);
    } catch (error: any) {
      console.error(`Error al unirse a la sala:`, error);
      client.emit('error', { message: error.message || 'Error al unirse a la sala' });
    }
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) return;

    const roomId = Number(data.roomId);
    if (isNaN(roomId)) return;

    const roomName = `room-${roomId}`;
    await client.leave(roomName);

    // Notificar a los demás en la sala
    client.to(roomName).emit('user_left', { roomId, user });
    console.log(`Usuario ${user.username} salió de la sala ${roomId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: { roomId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      client.emit('error', { message: 'Debe identificarse antes de enviar mensajes' });
      return;
    }

    const roomId = Number(data.roomId);
    if (isNaN(roomId)) {
      client.emit('error', { message: 'ID de sala inválido' });
      return;
    }

    if (!data.content || data.content.trim() === '') {
      client.emit('error', { message: 'El contenido del mensaje no puede estar vacío' });
      return;
    }

    try {
      // Guardar el mensaje en base de datos
      const message = await this.messagesService.create(roomId, user.id, data.content);

      // Emitir el mensaje a todos los conectados a la sala (incluyendo al emisor)
      const roomName = `room-${roomId}`;
      this.server.to(roomName).emit('new_message', message);
      console.log(`Mensaje de ${user.username} en sala ${roomId}: ${data.content}`);
    } catch (error: any) {
      console.error(`Error al enviar mensaje:`, error);
      client.emit('error', { message: error.message || 'Error al enviar el mensaje' });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) return;

    const roomId = Number(data.roomId);
    if (isNaN(roomId)) return;

    client.to(`room-${roomId}`).emit('user_typing', { roomId, user });
  }

  @SubscribeMessage('stop_typing')
  handleStopTyping(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) return;

    const roomId = Number(data.roomId);
    if (isNaN(roomId)) return;

    client.to(`room-${roomId}`).emit('user_stop_typing', { roomId, user });
  }

  private broadcastUsersStatus() {
    const users = Array.from(this.connectedUsers.values());
    // Evitar duplicados por id de usuario en la lista en línea (en caso de múltiples pestañas/conexiones)
    const uniqueUsers = Array.from(
      new Map(users.map((u) => [u.id, u])).values()
    );
    this.server.emit('users_status', uniqueUsers);
  }
}
