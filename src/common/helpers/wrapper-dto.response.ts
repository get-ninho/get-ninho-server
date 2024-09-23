import { HttpStatus } from '@nestjs/common';
import { MetadataDtoResponse } from './metadata-dto.response';
import { PaginationDtoResponse } from './pagination-dto.response';

export class WrapperDtoResponse<T> {
  private static STATUS_OK = 200;
  private static OK = 'OK';
  private static EMPTY = '';

  metadata: MetadataDtoResponse;
  data: T;

  constructor(data: T, metadata: MetadataDtoResponse) {
    this.data = data;
    this.metadata = metadata;
  }

  static of<T>(
    data: T,
    status: number = WrapperDtoResponse.STATUS_OK,
    statusText: string = WrapperDtoResponse.OK,
    message: string = WrapperDtoResponse.EMPTY,
    pagination?: PaginationDtoResponse,
  ): WrapperDtoResponse<T> {
    const metadata = MetadataDtoResponse.of(
      status,
      statusText,
      message,
      pagination,
    );
    return new WrapperDtoResponse(data, metadata);
  }

  static emptyList(): WrapperDtoResponse<any> {
    return this.of([]);
  }

  static empty(): WrapperDtoResponse<any> {
    return this.of([], HttpStatus.NO_CONTENT, 'No Content');
  }

  static emptyWithMetadata(
    status: number,
    statusText: string,
    message: string,
  ): WrapperDtoResponse<any> {
    return this.of(null, status, statusText, message);
  }
}
