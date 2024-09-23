import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRoleEnum } from 'src/users/common/enums/user-role.enum';

export class UserDtoRequest {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  cpfCnpj: string;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  bio?: string;

  @ApiPropertyOptional()
  rating?: number;

  @ApiProperty({
    enum: UserRoleEnum,
    examples: Object.keys(UserRoleEnum),
  })
  role: UserRoleEnum;
}
