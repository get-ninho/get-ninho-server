import { ApiProperty } from '@nestjs/swagger';
import { CategoryEnum } from 'src/jobs/common/enums/category.enum';

export class JobDtoResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  profisionalId: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  total: number;

  @ApiProperty({
    enum: CategoryEnum,
    examples: Object.keys(CategoryEnum),
  })
  category: CategoryEnum;
}
