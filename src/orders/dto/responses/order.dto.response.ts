import { ApiProperty } from '@nestjs/swagger';
import { OrderStatusEnum } from 'src/orders/common/enums/order-status.enum';
import { PaymentFormEnum } from 'src/orders/common/enums/payment-forms.enum';
import { PaymentStatusEnum } from 'src/orders/common/enums/payment-status.enum';
import { ImageDtoResponse } from './image.dto.reponse';

export class OrderDtoResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  professional: string;

  @ApiProperty()
  customer: string;

  @ApiProperty()
  service: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  finishDate: string;

  @ApiProperty()
  paymentForm: PaymentFormEnum;

  @ApiProperty()
  paymentStatus: PaymentStatusEnum;

  @ApiProperty()
  orderStatus: OrderStatusEnum;

  @ApiProperty()
  imagesUrl: ImageDtoResponse[];
}
