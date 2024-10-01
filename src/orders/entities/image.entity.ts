import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ServiceOrder } from './order.entity';

@Entity({ name: 'images' })
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  imageUrl: string;

  @ManyToOne(() => ServiceOrder, (order) => order.images)
  serviceOrder: ServiceOrder;
}
