import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from 'src/auth/services/auth.service';
import { UserRoleEnum } from 'src/users/common/enums/user-role.enum';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const { authorization } = request.headers;

    try {
      const data = this.authService.checkToken(
        (authorization ?? '').split(' ')[1],
      );

      if (data.roles.includes(UserRoleEnum.CLIENTE)) {
        request.customer = await this.userService.findOne(data.sub);
      }

      if (data.roles.includes(UserRoleEnum.PRESTADOR)) {
        request.prestador = await this.userService.findOne(data.sub);
      }

      request.payload = data;

      return true;
    } catch (error) {
      false;
    }
  }
}
