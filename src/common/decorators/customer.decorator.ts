import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const IsCustomer = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const customer = context.switchToHttp().getRequest().customer;

    return customer;
  },
);
