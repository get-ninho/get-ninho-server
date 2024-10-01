import { Injectable } from '@nestjs/common';
import { OrderDtoRequest } from '../dto/requests/create-order.dto.request';
import { UpdateOrderDto } from '../dto/requests/update-order.dto';

@Injectable()
export class OrdersService {
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
