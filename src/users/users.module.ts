import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { DatabaseModule } from 'src/database/database.module';
import { userRepository } from './repositories/user.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [...userRepository, UsersService],
  exports: [...userRepository],
})
export class UsersModule {}
