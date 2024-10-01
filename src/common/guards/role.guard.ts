import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from 'src/users/common/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/role.decorator';
import { WrapperDtoResponse } from '../helpers/wrapper-dto.response';
import { getHttpStatusMessage } from '../helpers/http-status.mesage';
import { UserDtoResponse } from 'src/users/dto/responses/user-dto.response';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: WrapperDtoResponse<UserDtoResponse> = request?.prestador;

    if (!user) {
      throw new HttpException(
        WrapperDtoResponse.emptyWithMetadata(
          HttpStatus.UNAUTHORIZED,
          getHttpStatusMessage(HttpStatus.UNAUTHORIZED),
          'Usuário não autenticado.',
        ),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const hasRole = requiredRoles.some((role) => {
      return user.data.roles?.includes(role);
    });

    if (!hasRole) {
      throw new HttpException(
        WrapperDtoResponse.emptyWithMetadata(
          HttpStatus.FORBIDDEN,
          getHttpStatusMessage(HttpStatus.FORBIDDEN),
          'Usuário não tem permissão para esta funcionalidade.',
        ),
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
