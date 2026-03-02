
import { Module } from '@nestjs/common';
import { TaskModule } from './tasks/tasks.module';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { TestController } from './test/test.controller';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [TaskModule, UsersModule, PaymentsModule],
  // providers: [UsersService],
  // controllers: [UsersController, TestController],
})
export class AppModule {}
