import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseInterceptors,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDtoRequest } from '../dto/requests/create-user-dto.request';
import { UpdateUserDtoRequest } from '../dto/requests/update-user-dto.request';
import { UserDtoResponse } from '../dto/responses/user-dto.response';
import { DatabaseErrorInterceptor } from 'src/common/errors/database-error.interceptor';
import { WrapperDtoResponse } from 'src/common/helpers/wrapper-dto.response';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { IsPrestador } from 'src/common/decorators/prestador.decorator';

@ApiTags('users')
@UseInterceptors(DatabaseErrorInterceptor)
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({
    status: 201,
    description: 'Create users',
    type: UserDtoResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @Post()
  create(
    @Body() dto: UserDtoRequest,
  ): Promise<WrapperDtoResponse<UserDtoResponse>> {
    return this.usersService.create(dto);
  }

  @ApiResponse({
    status: 200,
    description: 'Search all users',
    type: UserDtoResponse,
  })
  @ApiResponse({ status: 204, description: 'Users not found' })
  @Get()
  findAll(): Promise<WrapperDtoResponse<UserDtoResponse[]>> {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Search user by id',
    type: UserDtoResponse,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('/find')
  findOne(
    @IsPrestador() user: UserDtoResponse,
  ): Promise<WrapperDtoResponse<UserDtoResponse>> {
    return this.usersService.findOne(user.id);
  }

  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Update user',
    type: UserDtoResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Users not found' })
  @Patch()
  update(
    @IsPrestador() user: UserDtoResponse,
    @Body() updateUserDto: UpdateUserDtoRequest,
  ): Promise<WrapperDtoResponse<UserDtoResponse>> {
    return this.usersService.update(user.id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Remove person',
  })
  @ApiResponse({ status: 404, description: 'Person not found.' })
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @IsPrestador() user: UserDtoResponse,
  ): Promise<WrapperDtoResponse<void>> {
    return this.usersService.remove(user.id);
  }
}
