
import { Controller, Get, HttpCode, Param, ParseBoolPipe, ParseIntPipe, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express'
import { ValidationuserPipe } from './pipes/validationuser/validationuser.pipe';
import { AuthGuard } from './guards/auth/auth.guard';

@Controller()
export class TestController {

    @Get('/test')
    index (@Req() request: Request, @Res() response: Response) {
        console.log(request.url)
        response.status(200).json({
            message: 'Hola mundo',
        });
    }

    @Get('/new')
    @HttpCode(201)
    somethingNew () {
        return 'Something new!'
    }

    @Get('/notfound')
    @HttpCode(404)
    notfound () {
        return 'Not found route!'
    }

    @Get('/error')
    @HttpCode(500)
    errorPage () {
        return 'Error route!'
    }

    @Get('/ticket/:num')
    getNumber (@Param('num'
        , ParseIntPipe
    ) num: number) {
        return num + 100
    }

    @Get('/active/:status')
    getStatus(@Param('status', ParseBoolPipe) status: boolean) {
        console.log(typeof status);
        return status
    }
    
    @Get('greet')
    @UseGuards(AuthGuard)
    greet(@Query(ValidationuserPipe) query: {name:string, age:number}) {
        console.log(typeof query.name);
        console.log(typeof query.age);
        return `Hello ${query.name}, yo are ${query.age+10} years old`;
    }
}
