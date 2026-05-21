import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío' })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  @Length(3, 20, { message: 'El nombre de usuario debe tener entre 3 y 20 caracteres' })
  username!: string;
}
