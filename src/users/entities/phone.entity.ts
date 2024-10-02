import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'phones' })
@Unique(['internationalCode', 'localCode', 'phoneNumber'])
export class Phone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', width: 2, name: 'international_code' })
  internationalCode: number;

  @Column({ type: 'int', width: 2, name: 'local_code' })
  localCode: number;

  @Column({ type: 'int', width: 9, name: 'phone_number' })
  phoneNumber: number;

  @OneToOne(() => User, (user) => user.phone)
  @JoinColumn()
  user: User;
}
