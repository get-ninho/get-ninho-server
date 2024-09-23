import { PaginationDtoResponse } from './pagination-dto.response';

export class MetadataDtoResponse {
  timestamp: string;
  status: number;
  statusText: string;
  message: string;
  pagination?: PaginationDtoResponse;

  constructor(
    status: number,
    statusText: string,
    message: string,
    pagination?: PaginationDtoResponse,
  ) {
    this.timestamp = new Date().toISOString();
    this.status = status;
    this.statusText = statusText;
    this.message = message;
    this.pagination = pagination;
  }

  static of(
    status: number,
    statusText: string,
    message: string,
    pagination?: PaginationDtoResponse,
  ): MetadataDtoResponse {
    return new MetadataDtoResponse(status, statusText, message, pagination);
  }

  static empty(): MetadataDtoResponse {
    return this.of(204, 'No Content', 'Sem dados');
  }
}
