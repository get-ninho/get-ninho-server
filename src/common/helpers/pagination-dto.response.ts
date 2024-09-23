export class PaginationDtoResponse {
  size: number;
  page: number;
  totalPages: number;
  totalItems: number;
  first: boolean;
  last: boolean;

  constructor(size: number, page: number, totalItems: number) {
    this.size = size;
    this.page = page;
    this.totalItems = totalItems;
    this.totalPages = totalItems <= size ? 1 : Math.ceil(totalItems / size);
    this.first = page === 1;
    this.last = page === this.totalPages;
  }

  static of(
    size: number,
    page: number,
    totalItems: number,
  ): PaginationDtoResponse {
    return new PaginationDtoResponse(size, page, totalItems);
  }
}
