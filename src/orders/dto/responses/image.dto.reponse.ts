import { ApiProperty } from '@nestjs/swagger';

export class ImageDtoResponse {
  @ApiProperty()
  imageUrl: string;
}
