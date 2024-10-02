import { DataSource } from 'typeorm';
import { Phone } from '../entities/phone.entity';

export const phoneRepository = [
  {
    provide: 'PHONE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Phone),
    inject: ['DATA_SOURCE'],
  },
];
