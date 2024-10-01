import { PartialType } from '@nestjs/swagger';
import { OrderDtoRequest } from './create-order.dto.request';

export class UpdateOrderDto extends PartialType(OrderDtoRequest) {}
