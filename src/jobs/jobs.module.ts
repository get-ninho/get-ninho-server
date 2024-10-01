import { Module } from '@nestjs/common';
import { JobsService } from './services/jobs.service';
import { JobsController } from './controllers/jobs.controller';
import { jobRepository } from './repositories/job.repository';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';

import { UsersService } from 'src/users/services/users.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  controllers: [JobsController],
  providers: [...jobRepository, JobsService, UsersService],
  exports: [...jobRepository],
})
export class JobsModule {}
