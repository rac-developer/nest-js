# Plan de Implementación - Backend de Mensajería en Tiempo Real (Estilo Slack)

Este plan describe el diseño y la implementación para completar el backend del sistema de chat. Corregiremos primero los errores de TypeScript actuales y luego agregaremos los módulos necesarios para salas, mensajes y comunicación en tiempo real.

## User Review Required

- **Autenticación simplificada:** Se asume un flujo de inicio de sesión basado en `username` (si el usuario no existe, se crea automáticamente), tal como está en el servicio de usuarios actual.
- **WebSockets con Socket.io:** Configuraremos Socket.io para manejar eventos en tiempo real. Los clientes enviarán su nombre de usuario en el handshake (`auth.username` o `query.username`) o mediante un evento de identificación.

## Proposed Changes

### Core & Config

#### [MODIFY] [tsconfig.json](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/tsconfig.json)
- Eliminar la propiedad `"ignoreDeprecations": "6.0"` que causa el error `TS5103` en la versión actual de TypeScript (`5.7.3`).

#### [MODIFY] [prisma.service.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/prisma/prisma.service.ts)
- Cambiar la importación de `PrismaClient` desde `'../../generated/prisma'` a `'../../generated/prisma/client'` para resolver la ruta generada de TypeScript de manera correcta.

#### [MODIFY] [create-user.dto.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/users/dto/create-user.dto.ts)
- Agregar el operador de aserción definitiva `!` a la propiedad `username!: string` para evitar el error `TS2564` bajo el modo estricto de TypeScript.

---

### Módulo de Salas (Rooms)

Permite la creación, listado y consulta de salas de chat y su respectivo historial de mensajes.

#### [NEW] [create-room.dto.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/rooms/dto/create-room.dto.ts)
- Definición de DTO para la creación de salas, validando longitud del nombre (de 3 a 30 caracteres) y obligatoriedad.

#### [NEW] [rooms.service.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/rooms/rooms.service.ts)
- Métodos para crear salas (verificando duplicados), listar salas, obtener una sala por id y obtener el historial de mensajes de una sala (ordenado por `createdAt` asc, incluyendo la relación con el usuario emisor).

#### [NEW] [rooms.controller.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/rooms/rooms.controller.ts)
- Endpoints REST expuestos:
  - `POST /rooms` (Crear sala)
  - `GET /rooms` (Listar todas las salas)
  - `GET /rooms/:id` (Obtener detalle de sala)
  - `GET /rooms/:id/messages` (Obtener historial de mensajes de la sala)

#### [NEW] [rooms.module.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/rooms/rooms.module.ts)
- Encapsula el controlador y servicio de Salas, importando `PrismaModule` y exportando `RoomsService`.

---

### Módulo de Mensajes (Messages)

Maneja la lógica de persistencia de los mensajes que se envían.

#### [NEW] [messages.service.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/messages/messages.service.ts)
- Método `create(roomId: number, userId: number, content: string)` para guardar nuevos mensajes en la base de datos a través de Prisma.

#### [NEW] [messages.module.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/messages/messages.module.ts)
- Registro del servicio de mensajes, importando `PrismaModule` y exportando `MessagesService`.

---

### Módulo de Chat (WebSockets)

Maneja la comunicación bidireccional en tiempo real con Socket.io.

#### [NEW] [chat.gateway.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/chat/chat.gateway.ts)
- `@WebSocketGateway` con CORS habilitado.
- Control de conexiones (`handleConnection`) y desconexiones (`handleDisconnect`).
- Flujo de identificación del usuario:
  - Al conectarse, se lee el `username` de `handshake.auth.username` o `handshake.query.username`. Se busca o crea el usuario en la DB y se almacena en memoria de sockets activos (`socket.data.user`).
  - Si no viene en el handshake, el cliente puede emitir un evento `register` con su nombre de usuario.
- Lista de usuarios activos en línea: se emite un broadcast a todos con los usuarios conectados actualmente (`users_status`).
- **Evento `join_room`**:
  - Parámetros: `{ roomId: number }`.
  - El cliente se une a la sala de Socket.io `room-${roomId}`.
  - El servidor le responde con el historial de mensajes de la sala (`RoomsService.getMessages(roomId)`).
  - El servidor emite un evento de broadcast en la sala: `user_joined` indicando el nombre del usuario que entró.
- **Evento `leave_room`**:
  - Parámetros: `{ roomId: number }`.
  - El cliente abandona la sala y se emite un broadcast a la sala: `user_left`.
- **Evento `send_message`**:
  - Parámetros: `{ roomId: number, content: string }`.
  - Guarda el mensaje en la base de datos con `MessagesService` (asociado al usuario del socket).
  - Emite `new_message` con la información del mensaje y los datos del usuario emisor a toda la sala de Socket.io.
- **Eventos de Escritura (`typing` / `stop_typing`)**:
  - Parámetros: `{ roomId: number }`.
  - Emite en broadcast (excluyendo al remitente) que el usuario está escribiendo o dejó de escribir.

#### [NEW] [chat.module.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/chat/chat.module.ts)
- Registra `ChatGateway`. Importa `UsersModule`, `RoomsModule` y `MessagesModule`.

---

### Configuración de la Aplicación

#### [MODIFY] [app.module.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/app.module.ts)
- Importar `PrismaModule`, `UsersModule`, `RoomsModule`, `MessagesModule` y `ChatModule` para integrarlos en el árbol principal.

#### [MODIFY] [main.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/main.ts)
- Activar globalmente el `ValidationPipe` para validar DTOs automáticamente.
- Habilitar CORS en la aplicación NestJS para admitir conexiones de clientes frontend locales.

---

## Verification Plan

### Automated Tests
- Validaremos la correcta compilación y tests básicos del backend ejecutando:
  ```bash
  pnpm run build
  pnpm run test
  ```

### Manual Verification
- Levantaremos la aplicación localmente en modo desarrollo:
  ```bash
  pnpm run start:dev
  ```
- Comprobaremos mediante peticiones REST (como `GET /rooms`, `POST /rooms`, etc.) que el servidor responde correctamente.
- Probaremos las conexiones de WebSockets simulando clientes WebSocket en Node.js, una extensión de VS Code o una herramienta externa (como Postman o Bruno) conectándose al puerto `3000`.
