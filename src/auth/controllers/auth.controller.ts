import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { WrapperDtoResponse } from 'src/common/helpers/wrapper-dto.response';
import { UserLoginDtoRequest } from 'src/users/dto/requests/login-user-dto.request';
import { UserLoginDtoResponse } from 'src/users/dto/responses/login-user.response';
import { AuthService } from '../services/auth.service';

@ApiTags('authentication')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 201,
    description: 'Login',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Post('/signin')
  login(
    @Body() dto: UserLoginDtoRequest,
  ): Promise<WrapperDtoResponse<UserLoginDtoResponse>> {
    return this.authService.login(dto.email, dto.password);
  }
}
