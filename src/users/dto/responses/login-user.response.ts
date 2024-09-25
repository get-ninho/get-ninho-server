import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDtoResponse {
  @ApiProperty()
  bearer: string;
}
