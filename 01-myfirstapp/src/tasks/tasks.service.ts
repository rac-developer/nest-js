
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export interface Task {
    title: string;
    description: string;
    status: boolean;
    id: number
}

@Injectable()
export class TasksService {

    private tasks: Task[] = [];

    //GET
    getTasks(){
        return this.tasks;
    }
    
    getTask(id: number){
        const taskFound = this.tasks.find(task => task.id === id);
        // Condicion por si no retornar el id
        if(!taskFound) {
            return new NotFoundException(`Task with ${id} not found`)
        }

        return taskFound
    }

    //POST
    createTask(task: CreateTaskDto): Task {
        const newTask = {
            ...task,
            id: this.tasks.length + 1,
            status: false
        };
        this.tasks.push(newTask);
        return newTask;
    }

    updateTask(task: UpdateTaskDto) {
        console.log(task)
        return 'Actualizando tarea'
    }

    deleteTask() {
        return 'Eliminando tarea'
    }

    patchTask() {
            return 'Actualizando parcialmente tarea'
    }
}
