import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseErrorInterceptor } from './common/errors/database-error.interceptor';
import { DatabaseService } from './database/database.service';
import { AuthModule } from './auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    DatabaseModule,
    UsersModule,
    AuthModule,
    JobsModule,
    EvaluationModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DatabaseErrorInterceptor,
    },
    DatabaseService,
  ],
})
export class AppModule {}
