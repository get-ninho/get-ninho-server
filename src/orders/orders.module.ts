import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { serviceOrderRepository } from './repoitories/service-order.repoitory';
import { imageRepository } from './repoitories/image.repository';
import { JobsService } from 'src/jobs/services/jobs.service';
import { UsersService } from 'src/users/services/users.service';

@Module({
  imports: [DatabaseModule, AuthModule, JobsModule, UsersModule],
  controllers: [OrdersController],
  providers: [
    ...serviceOrderRepository,
    ...imageRepository,
    OrdersService,
    JobsService,
    UsersService,
  ],
})
export class OrdersModule {}
