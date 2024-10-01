import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserRoleEnum } from '../common/enums/user-role.enum';
import { User } from './user.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserRoleEnum })
  role: UserRoleEnum;

  @ManyToOne(() => User, (user) => user.roles)
  user: User;
}
