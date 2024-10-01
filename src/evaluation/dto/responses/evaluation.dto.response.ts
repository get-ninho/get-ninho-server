import { ApiProperty } from '@nestjs/swagger';

export class EvaluationDtoResponse {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  professionalId: number;

  @ApiProperty()
  customerId: number;

  @ApiProperty()
  jobId: number;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
