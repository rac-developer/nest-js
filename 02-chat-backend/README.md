1. **Instalar las dependencias** del proyecto:
   ```bash
   pnpm install
   ```

2. **Configurar las variables de entorno**:
   Asegurarte de crear el archivo `.env` en la raíz del proyecto con la misma configuración de base de datos que tienes ahora (`DATABASE_URL`, `PORT`, etc.), ya que los archivos `.env` generalmente no se suben a GitHub.

3. **Levantar la base de datos** (Docker debe estar abierto):
   ```bash
   docker-compose up -d
   ```

4. **Sincronizar la base de datos** (Para que Prisma cree las tablas en la base de datos recién creada):
   ```bash
   pnpm prisma db push
   # o pnpm prisma migrate dev (dependiendo de tu flujo de trabajo)
   ```

5. **Iniciar el servidor de NestJS** en modo desarrollo:
   ```bash
   pnpm run start:dev
   ```
