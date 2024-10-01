import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EvaluationDtoRequest {
  @ApiProperty()
  @IsNotEmpty({ message: 'Prestador de serviço obrigatório' })
  @IsNumber({}, { message: 'Formato do campo prestador de serviço inválido' })
  professionalId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Serviço obrigatório' })
  @IsNumber({}, { message: 'Formato do  serviço inválido' })
  jobId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Nota de avaliação obrigatório' })
  @IsNumber({}, { message: 'Formato do nota de avaliação de serviço inválido' })
  rating: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Descrição obrigatória' })
  @IsString({ message: 'Formato do campo descrição inválido' })
  description: string;
}
