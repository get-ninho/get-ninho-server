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
    @IsCustomer() user: WrapperDtoResponse<UserDtoResponse>,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() dto: OrderDtoRequest,
  ): Promise<WrapperDtoResponse<OrderDtoResponse>> {
    return this.ordersService.create(user, dto, files);
  }

  @ApiResponse({
    status: 200,
    description: 'Search all service orders',
    type: OrderDtoResponse,
  })
  @ApiResponse({ status: 204, description: 'Service orders not found' })
  @Get()
  findAll(
    @IsCustomer() user: WrapperDtoResponse<UserDtoResponse>,
  ): Promise<WrapperDtoResponse<OrderDtoResponse[]>> {
    return this.ordersService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
