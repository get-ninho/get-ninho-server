import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { DatabaseModule } from 'src/database/database.module';
import { userRepository } from './repositories/user.repository';
import { AuthModule } from 'src/auth/auth.module';
import { roleRepository } from './repositories/role.repository';
import { phoneRepository } from './repositories/phone.repository';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UsersController],
  providers: [
    ...userRepository,
    ...roleRepository,
    ...phoneRepository,
    UsersService,
  ],
  exports: [...userRepository, ...roleRepository, ...phoneRepository],
})
export class UsersModule {}
