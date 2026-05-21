import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    const existingRoom = await this.prisma.room.findUnique({
      where: { name: createRoomDto.name },
    });

    if (existingRoom) {
      throw new ConflictException(`La sala con nombre "${createRoomDto.name}" ya existe`);
    }

    return this.prisma.room.create({
      data: { name: createRoomDto.name },
    });
  }

  async findAll() {
    return this.prisma.room.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException(`La sala con ID ${id} no existe`);
    }

    return room;
  }

  async getMessages(roomId: number) {
    // Verificar que la sala exista primero
    await this.findOne(roomId);

    return this.prisma.message.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
