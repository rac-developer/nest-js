
import {
    IsString,
    MinLength
} from 'class-validator'

export class CreateTaskDto {

    // @IsString valida que sea un string
    // @MinLength valida que sea minimo un caracter
    @IsString()
    @MinLength(1)
    title: string

    @IsString()
    @MinLength(1)
    description: string
}