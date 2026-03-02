
import { Body, Controller, Delete, Get, Patch, Post, Put, Query, Param, ParseIntPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('/tasks')

export class TasksController {

    constructor(private taskServices: TasksService) {
        this.taskServices = taskServices
    }

    @Get()
    getAllTasks(@Query() query: any) {
        console.log(query)
        return this.taskServices.getTasks();
    }


    //Manera de convertir la cadena de texto en un number
    
    // @Get('/:id')
    // getTasks(@Param('id') id:string) {
    //     console.log(id)
    //     return this.taskServices.getTask(parseInt(id));
    // }

    //Segunda manera y la mas recomendada es ParseIntPipe para convertir automáticamente el parámetro de la URL a un número. Esto simplifica el código y asegura que el valor sea validado antes de llegar al método.

    @Get('/:id')
    getTasks(@Param('id', ParseIntPipe) id: number) { // Usamos ParseIntPipe para convertir el id a number
        console.log(id);
        return this.taskServices.getTask(id);
    }

    @Post()
    // Con el @Body recibimos el body de la peticion y tenemos que importarlo de nest
    createTask(@Body() task:CreateTaskDto) {
        return this.taskServices.createTask(task);
    }

    @Put() 
    updateTask(@Body() task:UpdateTaskDto) {
        return this.taskServices.updateTask(task);
    }

    @Delete()
    deleteTask() {
        return this.taskServices.deleteTask();
    }

    @Patch() 
    patchTask() {
        return this.taskServices.patchTask();
    }
}
