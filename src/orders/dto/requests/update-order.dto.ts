import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatusEnum } from 'src/orders/common/enums/order-status.enum';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatusEnum, {
    message: 'Formato do campo enum inválido',
  })
  @ApiProperty({
    enum: OrderStatusEnum,
    examples: Object.values(OrderStatusEnum),
  })
  orderStatus: OrderStatusEnum;
}
