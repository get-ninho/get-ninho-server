import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CategoryEnum } from 'src/jobs/common/enums/category.enum';

export class JobDtoRequest {
  @IsNotEmpty({ message: 'Descrição obrigatória' })
  @IsString({ message: 'Formato do campo descrição inválido' })
  @ApiProperty()
  description: string;

  @IsNotEmpty({ message: 'Preço obrigatório' })
  @IsNumber({}, { message: 'Formato do campo preço inválido' })
  @ApiProperty()
  total: number;

  @IsEnum(CategoryEnum, { message: 'Formato do campo enum inválido' })
  @ApiProperty({
    enum: CategoryEnum,
    examples: Object.keys(CategoryEnum),
  })
  category: CategoryEnum;
}
