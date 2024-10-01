import { Inject, Injectable } from '@nestjs/common';
import { OrderDtoRequest } from '../dto/requests/create-order.dto.request';
import { UpdateOrderDto } from '../dto/requests/update-order.dto';
import { ServiceOrder } from '../entities/order.entity';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('SERVICE_ORDER_REPOSITORY')
    private readonly orderRepository: Repository<ServiceOrder>,

    @Inject('IMAGE_REPOSITORY')
    private readonly imageRepository: Repository<Image>,
  ) {}

  create(createOrderDto: OrderDtoRequest) {
    return 'This action adds a new order';
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
