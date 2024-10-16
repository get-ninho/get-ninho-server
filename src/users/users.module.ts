import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { DatabaseModule } from 'src/database/database.module';
import { userRepository } from './repositories/user.repository';
import { AuthModule } from 'src/auth/auth.module';
import { roleRepository } from './repositories/role.repository';
import { phoneRepository } from './repositories/phone.repository';
import { EvaluationModule } from 'src/evaluation/evaluation.module';
import { EvaluationService } from 'src/evaluation/services/evaluation.service';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule),
    forwardRef(() => EvaluationModule),
    forwardRef(() => JobsModule),
  ],
  controllers: [UsersController],
  providers: [
    ...userRepository,
    ...roleRepository,
    ...phoneRepository,
    UsersService,
    EvaluationService,
  ],
  exports: [
    ...userRepository,
    ...roleRepository,
    ...phoneRepository,
    UsersService,
    EvaluationService,
  ],
})
export class UsersModule {}
