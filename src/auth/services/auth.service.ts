import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WrapperDtoResponse } from 'src/common/helpers/wrapper-dto.response';
import { UserRoleEnum } from 'src/users/common/enums/user-role.enum';
import { UserLoginDtoResponse } from 'src/users/dto/responses/login-user.response';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async login(
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

    const roles: UserRoleEnum[] = userResponse.data.roles.map(
      (role) => role.role,
    );

    const payload = {
      sub: userResponse.data.id,
      name: userResponse.data.firstName,
      email: userResponse.data.email,
      roles: roles,
    };

    const response: UserLoginDtoResponse = {
      bearer: await this.jwtService.signAsync(payload),
    };

    return WrapperDtoResponse.of(response);
  }

  public checkToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
