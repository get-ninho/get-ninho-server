import { Module } from '@nestjs/common';
import { EvaluationService } from './services/evaluation.service';
import { EvaluationController } from './controllers/evaluation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Evaluation, EvaluationSchema } from './schemas/evaluation.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { UsersService } from 'src/users/services/users.service';
import { JobsService } from 'src/jobs/services/jobs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Evaluation.name, schema: EvaluationSchema },
    ]),
    AuthModule,
    UsersModule,
    JobsModule,
  ],
  controllers: [EvaluationController],
  providers: [EvaluationService, UsersService, JobsService],
})
export class EvaluationModule {}
