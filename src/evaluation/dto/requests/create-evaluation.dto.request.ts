import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

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
  @Min(1, { message: 'A nota de avaliação deve ser no mínimo 1' })
  @Max(5, { message: 'A nota de avaliação deve ser no máximo 5' })
  rating: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Descrição obrigatória' })
  @IsString({ message: 'Formato do campo descrição inválido' })
  description: string;
}
