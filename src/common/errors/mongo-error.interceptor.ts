import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Error as MongooseError } from 'mongoose';
import { HttpStatus } from '@nestjs/common/enums';
import { WrapperDtoResponse } from '../helpers/wrapper-dto.response';
import { getHttpStatusMessage } from '../helpers/http-status.mesage';

@Injectable()
export class MongoValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof MongooseError.ValidationError) {
          const messages = this.formatValidationErrors(error);
          throw new BadRequestException(
            WrapperDtoResponse.of(
              null,
              HttpStatus.BAD_REQUEST,
              getHttpStatusMessage(HttpStatus.BAD_REQUEST),
              `Os seguintes campos são inválidos ou estão faltando: ${messages}`,
            ),
          );
        }

        throw error;
      }),
    );
  }

  private formatValidationErrors(error: MongooseError.ValidationError): string {
    return Object.values(error.errors)
      .map((err) => err.message)
      .join(', ');
  }
}
