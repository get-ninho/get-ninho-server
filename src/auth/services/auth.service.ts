import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WrapperDtoResponse } from 'src/common/helpers/wrapper-dto.response';
import { UserLoginDtoResponse } from 'src/users/dto/responses/login-user.response';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<WrapperDtoResponse<UserLoginDtoResponse>> {
    const userResponse = await this.usersService.getUserByEmail(
      email,
      password,
    );

    if (!userResponse.data) {
      return WrapperDtoResponse.emptyWithMetadata(
        userResponse.metadata.status,
        userResponse.metadata.statusText,
        userResponse.metadata.message,
      );
    }

    const payload = {
      sub: userResponse.data.id,
      name: userResponse.data.firstName,
      email: userResponse.data.email,
      role: userResponse.data.role,
    };

    const response: UserLoginDtoResponse = {
      bearer: await this.jwtService.signAsync(payload),
    };

    return WrapperDtoResponse.of(response);
  }
}
