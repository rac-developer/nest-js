
import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class UsersController {

    constructor(private usersService: UsersService) {}

    @Get('/users')
    
    @ApiOperation({summary:'Get all users'})

    @ApiResponse({status: 200, description: 'Success'})
    getUsers() {
        return this.usersService.getUsers()
    }

    @Post('/users')
    createUser(@Body() user: CreateUserDto) {
        return this.usersService.createUser(user)
    }
}
