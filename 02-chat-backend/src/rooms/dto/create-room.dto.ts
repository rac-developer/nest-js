import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty({ message: 'El nombre de la sala no puede estar vacío' })
  @IsString({ message: 'El nombre de la sala debe ser una cadena de texto' })
  @Length(3, 30, { message: 'El nombre de la sala debe tener entre 3 y 30 caracteres' })
  name!: string;
}
