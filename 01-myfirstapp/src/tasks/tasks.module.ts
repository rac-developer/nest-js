
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
    controllers: [TasksController],
    // Para importar el servicio en modulo
    providers: [TasksService],
})
export class TaskModule {}