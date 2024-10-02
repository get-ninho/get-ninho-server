import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Job } from 'src/jobs/entities/job.entity';
import { Role } from './role.entity';
import { ServiceOrder } from 'src/orders/entities/order.entity';
import { Phone } from './phone.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 50, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 14, name: 'cpf_cnpj', unique: true })
  cpfCnpj: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true, name: 'image_url' })
  imageUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  bio?: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  rating?: number;

  @Column({ type: 'varchar', length: 2 })
  state: string;

  @Column({ type: 'varchar', length: 20 })
  city: string;

  @Column({ type: 'varchar', length: 50 })
  address: string;

  @Column({ type: 'integer' })
  addressNumber: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  complement?: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Role, (role) => role.user)
  roles: Role[];

  @OneToOne(() => Phone, (phone) => phone.user)
  phone: Phone;

  @OneToMany(() => Job, (job) => job.user)
  jobs: Job[];

  @OneToMany(() => ServiceOrder, (serviceOrder) => serviceOrder.customer)
  serviceOrdersAsCustomer: ServiceOrder[];

  @OneToMany(() => ServiceOrder, (serviceOrder) => serviceOrder.professional)
  serviceOrdersAsProfessional: ServiceOrder[];
}
