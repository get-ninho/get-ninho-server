import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { QueryFailedError } from 'typeorm';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class DatabaseErrorInterceptor implements NestInterceptor {
  constructor(private databaseService: DatabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(async (error) => {
        if (error instanceof QueryFailedError) {
          if (error.driverError && error.driverError.code === 'ER_DUP_ENTRY') {
            const entityName = this.getEntityNameFromError(error);
            const uniqueConstraints =
              await this.databaseService.getUniqueConstraints(entityName);
            const fieldName = this.extractFieldNameFromError(
              uniqueConstraints,
              error.driverError.sqlMessage,
            );

            throw new ConflictException(
              `${fieldName} duplicado. Por favor, verifique os dados.`,
            );
          } else if (
            error.driverError &&
            error.driverError.sqlMessage.includes('Data too long for column')
          ) {
            const columnName = this.extractColumnNameFromLenghtError(
              error.driverError.sqlMessage,
            );
            throw new BadRequestException(
              `O valor para a coluna ${columnName} excede o limite permitido. Por favor, verifique os dados.`,
            );
          }
        }

        throw error;
      }),
    );
  }

  private extractColumnNameFromLenghtError(message: string): string {
    const match = message.match(/Data too long for column '([^']+)'/);
    if (match) {
      return match[1];
    }
    return 'coluna desconhecida';
  }

  private getEntityNameFromError(error: any): string {
    const match = error.driverError.sqlMessage.match(/for key '([^']+)'/);
    if (match) {
      return match[1].split('.')[0];
    }
    return 'unknown_entity';
  }

  private extractFieldNameFromError(
    uniqueConstraints: any[],
    message: string,
  ): string {
    const match = message.match(/for key '([^']+)'/);
    if (match) {
      const key = match[1].split('.').pop();
      const constraint = uniqueConstraints.find((c) => c.name === key);

      if (constraint) {
        return `${constraint.columns.join(', ')} já está em uso.`;
      }
    }
    return 'Campo duplicado. Verifique os dados.';
  }
}
