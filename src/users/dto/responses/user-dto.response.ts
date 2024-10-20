import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEnum } from 'src/users/common/enums/user-role.enum';

export class UserDtoResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  cpfCnpj: string;

  @ApiProperty()
  imageUrl?: string;

  @ApiProperty()
  bio?: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  addressNumber: number;

  @ApiProperty()
  complement?: string;

  @ApiProperty()
  rating?: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty({
    enum: UserRoleEnum,
    examples: Object.keys(UserRoleEnum),
  })
  roles: UserRoleEnum[];
}
