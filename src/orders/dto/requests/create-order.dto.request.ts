import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentFormEnum } from 'src/orders/common/enums/payment-forms.enum';

export class OrderDtoRequest {
  @IsNotEmpty({ message: 'Profisional obrigatório' })
  @IsString({ message: 'Formato do campo profissional inválido' })
  @ApiProperty()
  professionalId: string;

  @IsNotEmpty({ message: 'Serviço obrigatório' })
  @IsString({ message: 'Formato do campo serviço inválido' })
  @ApiProperty()
  jobId: string;

  @IsEnum(PaymentFormEnum, {
    message: 'Formato do campo enum inválido',
  })
  @ApiProperty({
    enum: PaymentFormEnum,
    examples: Object.values(PaymentFormEnum),
  })
  paymentForm: PaymentFormEnum;
}
