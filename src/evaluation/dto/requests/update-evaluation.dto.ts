import { PartialType } from '@nestjs/swagger';
import { EvaluationDtoRequest } from './create-evaluation.dto.request';

export class UpdateEvaluationDto extends PartialType(EvaluationDtoRequest) {}
