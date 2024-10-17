import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { OrderDtoRequest } from '../dto/requests/create-order.dto.request';
import { UpdateOrderDto } from '../dto/requests/update-order.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { IsCustomer } from 'src/common/decorators/customer.decorator';
import { UserDtoResponse } from 'src/users/dto/responses/user-dto.response';
import { WrapperDtoResponse } from 'src/common/helpers/wrapper-dto.response';
import { OrderDtoResponse } from '../dto/responses/order.dto.response';
import { IsPrestador } from 'src/common/decorators/prestador.decorator';

@ApiTags('Orders Service')
@UseGuards(AuthGuard)
@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiResponse({
    status: 201,
    description: 'Created service orders',
    type: OrderDtoResponse,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @UseInterceptors(FilesInterceptor('images', 8))
  @Post()
  create(
    @IsPrestador() user: WrapperDtoResponse<UserDtoResponse>,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() dto: OrderDtoRequest,
  ): Promise<WrapperDtoResponse<OrderDtoResponse>> {
    return this.ordersService.create(user, dto, files);
  }

  @ApiResponse({
    status: 200,
    description: 'Search all service orders by customer',
    type: OrderDtoResponse,
  })
  @ApiResponse({ status: 204, description: 'Service orders not found' })
  @Get()
  findAll(
    @IsCustomer() user: WrapperDtoResponse<UserDtoResponse>,
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
  ): Promise<WrapperDtoResponse<OrderDtoResponse[]>> {
    return this.ordersService.findAll(user, page, size);
  }

  @ApiResponse({
    status: 200,
    description: 'Find service order by customer and order',
    type: OrderDtoResponse,
  })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  @Get(':id')
  findOne(
    @IsCustomer() user: WrapperDtoResponse<UserDtoResponse>,
    @Param('id') id: string,
  ): Promise<WrapperDtoResponse<OrderDtoResponse>> {
    return this.ordersService.findOne(user, +id);
  }

  @ApiResponse({
    status: 200,
    description: 'Update order',
    type: OrderDtoResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @UseInterceptors(FilesInterceptor('images', 8))
  @Patch(':id')
  update(
    @IsPrestador() user: WrapperDtoResponse<UserDtoResponse>,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
  ): Promise<WrapperDtoResponse<OrderDtoResponse>> {
    return this.ordersService.update(+id, dto, user, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
