import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from 'src/users/common/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/role.decorator';
import { WrapperDtoResponse } from '../helpers/wrapper-dto.response';
import { getHttpStatusMessage } from '../helpers/http-status.mesage';
import { UserDtoResponse } from 'src/users/dto/responses/user-dto.response';
import { MetadataDtoResponse } from '../helpers/metadata-dto.response';
import { BusinessException } from '../errors/business-exception.error';

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
      const metadata = MetadataDtoResponse.of(
        HttpStatus.UNAUTHORIZED,
        getHttpStatusMessage(HttpStatus.UNAUTHORIZED),
        'Usuário não autenticado.',
      );

      throw new BusinessException(metadata);
    }

    const hasRole = requiredRoles.some((role) => {
      return user.data.roles?.includes(role);
    });

    if (!hasRole) {
      const metadata = MetadataDtoResponse.of(
        HttpStatus.FORBIDDEN,
        getHttpStatusMessage(HttpStatus.FORBIDDEN),
        'Usuário não tem permissão para esta funcionalidade.',
      );

      throw new BusinessException(metadata);
    }

    return true;
  }
}
