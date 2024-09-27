import { PartialType } from '@nestjs/swagger';
import { JobDtoRequest } from './create-job-dto.request';

export class UpdateJobDtoRequest extends PartialType(JobDtoRequest) {}
