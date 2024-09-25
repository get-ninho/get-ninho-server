import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const IsPrestador = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const prestador = context.switchToHttp().getRequest().prestador;

    return prestador;
  },
);
