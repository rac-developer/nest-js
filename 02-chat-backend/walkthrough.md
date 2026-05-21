# Guía de Entrega (Walkthrough) - Chat Backend Estilo Slack

Hemos finalizado con éxito la implementación del backend para el sistema de mensajería en tiempo real. A continuación, se detallan los componentes construidos, la estructura de eventos en tiempo real y cómo interactuar con el sistema.

## Cambios Realizados

### Corrección de Errores Críticos
1. **Configuración de TS:** Se eliminó la propiedad `"ignoreDeprecations": "6.0"` en [tsconfig.json](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/tsconfig.json) que causaba fallos en el compilador.
2. **Importaciones de Prisma:** Se corrigió el path de importación en [prisma.service.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/prisma/prisma.service.ts) a `'../../generated/prisma/client'`.
3. **Modo Estricto de DTO:** Se añadió el operador `!` a la propiedad `username` en [create-user.dto.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/users/dto/create-user.dto.ts).

### Módulos Nuevos y Estructura
1. **Salas (Rooms):**
   - [create-room.dto.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/rooms/dto/create-room.dto.ts): Valida la entrada del nombre de la sala.
   - [rooms.service.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/rooms/rooms.service.ts): Lógica de base de datos para CRUD e historial.
   - [rooms.controller.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/rooms/rooms.controller.ts): Expone endpoints HTTP REST.
   - [rooms.module.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/rooms/rooms.module.ts): Encapsulación de dependencias.
2. **Mensajes (Messages):**
   - [messages.service.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/messages/messages.service.ts): Lógica de persistencia de mensajes con usuario relacionado.
   - [messages.module.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/messages/messages.module.ts): Proveedor del servicio de mensajería.
3. **Usuarios (Users):**
   - [users.module.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/users/users.module.ts): Creado para exportar `UsersService` a otros módulos.
4. **Chat (WebSockets):**
   - [chat.gateway.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/chat/chat.gateway.ts): Gateway Socket.io para manejar conexiones, identificación, salas de chat, eventos de escritura e historial en tiempo real.
   - [chat.module.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/chat/chat.module.ts): Encapsula el Gateway de chat.
5. **Bootstrap y App:**
   - [app.module.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/app.module.ts): Integración de todos los módulos.
   - [main.ts](file:///D:/desar/Ale/Learning/Programacion/nest-js/02-chat-backend/src/main.ts): Activación global de tuberías de validación y CORS.

---

## Especificación del API HTTP (REST)

| Método | Endpoint | Descripción | Body / Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/rooms` | Crea una nueva sala de chat | `{ "name": "General" }` |
| **GET** | `/rooms` | Retorna todas las salas de chat | *Ninguno* |
| **GET** | `/rooms/:id` | Retorna detalles de una sala concreta | `id` (número) |
| **GET** | `/rooms/:id/messages` | Retorna la lista histórica de mensajes | `id` (número) |

---

## Protocolo de Comunicación en Tiempo Real (Socket.io)

### 1. Conexión y Registro
Los clientes pueden autenticarse de dos formas:
* **Mediante Handshake:** Enviando el parámetro `username` en el payload de `auth` o `query` (p. ej., `io('ws://localhost:3000', { auth: { username: 'Ale' } })`). El servidor lo registrará automáticamente.
* **Mediante Evento:** Enviando el evento `register` posterior a la conexión:
  * **Payload:** `{ "username": "Ale" }`
  * **Respuesta exitosa:** Evento `registered` con los datos del usuario.

### 2. Canales y Mensajería
* **Unirse a Sala (`join_room`):**
  * **Payload:** `{ "roomId": 1 }`
  * **Respuesta:** Emite `room_history` con `{ roomId, messages }` al cliente emisor, y transmite `user_joined` al resto de la sala.
* **Salir de Sala (`leave_room`):**
  * **Payload:** `{ "roomId": 1 }`
  * **Transmisión:** Evento `user_left` al resto de la sala.
* **Enviar Mensaje (`send_message`):**
  * **Payload:** `{ "roomId": 1, "content": "Hola equipo!" }`
  * **Transmisión:** Evento `new_message` a toda la sala con la estructura:
    ```json
    {
      "id": 15,
      "content": "Hola equipo!",
      "createdAt": "2026-05-21T18:20:00.000Z",
      "roomId": 1,
      "userId": 3,
      "user": {
        "id": 3,
        "username": "Ale"
      }
    }
    ```

### 3. Presencia e Indicadores de Actividad
* **Usuarios Activos (`users_status`):**
  * Emisión automática global cuando un usuario se conecta, desconecta o registra, enviando una lista única de objetos de usuario en línea.
* **Escribiendo (`typing` / `stop_typing`):**
  * **Payload:** `{ "roomId": 1 }`
  * **Transmisión:** Emite `user_typing` o `user_stop_typing` al resto de miembros de la sala.

---

## Verificación de Compilación y Calidad
Hemos ejecutado con éxito la compilación del backend usando `pnpm run build` sin advertencias ni errores de TypeScript.
