import { HttpStatus } from '@nestjs/common';

const HttpStatusMessages = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.OK]: 'OK',
  [HttpStatus.CREATED]: 'Created',
  [HttpStatus.CONFLICT]: 'Conflict',
};

export const getHttpStatusMessage = (status: HttpStatus): string => {
  return HttpStatusMessages[status] || 'Unknown Status';
};
