import { ApiProperty } from '@nestjs/swagger';
import { CategoryEnum } from 'src/jobs/common/enums/category.enum';
import { User } from 'src/users/entities/user.entity';

export class JobDtoResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  profisional: User;

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
