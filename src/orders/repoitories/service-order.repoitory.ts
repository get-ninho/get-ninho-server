import { DataSource } from 'typeorm';
import { ServiceOrder } from '../entities/order.entity';

export const serviceOrderRepository = [
  {
    provide: 'SERVICE_ORDER_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ServiceOrder),
    inject: ['DATA_SOURCE'],
  },
];
