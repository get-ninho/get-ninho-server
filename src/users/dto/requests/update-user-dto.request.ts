import { PartialType } from '@nestjs/mapped-types';
import { UserDtoRequest } from './create-user-dto.request';

export class UpdateUserDtoRequest extends PartialType(UserDtoRequest) {}
