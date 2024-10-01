import { MetadataDtoResponse } from '../helpers/metadata-dto.response';
import { BaseException } from './base-exception.error';

export class BusinessException extends BaseException {
  constructor(statusCode: number, statusText: string, message: string);
  constructor(metadata: MetadataDtoResponse);
  constructor(
    statusCodeOrMetadata: number | MetadataDtoResponse,
    statusText?: string,
    message?: string,
  ) {
    if (typeof statusCodeOrMetadata === 'object') {
      super(
        statusCodeOrMetadata.status,
        statusCodeOrMetadata.statusText,
        statusCodeOrMetadata.message,
      );
    } else {
      super(statusCodeOrMetadata, statusText, message);
    }
  }
}
