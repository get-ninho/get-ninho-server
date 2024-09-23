import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRoleEnum } from '../common/enums/user-role.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 50, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 14, name: 'cpf_cnpj' })
  cpfCnp: string;

  @Column({ type: 'varchar', length: 50 })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true, name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  bio: string;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  rating: number;

  @Column({ type: 'enum', enum: UserRoleEnum })
  role: UserRoleEnum;
}
