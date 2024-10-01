/* eslint-disable @typescript-eslint/no-unused-vars */
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const size = 1.5 * 1024 * 1024;
    return value.size < size;
  }
}
