import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EvaluationService } from '../services/evaluation.service';
import { EvaluationDtoRequest } from '../dto/requests/create-evaluation.dto.request';
import { UpdateEvaluationDto } from '../dto/requests/update-evaluation.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { IsCustomer } from 'src/common/decorators/customer.decorator';
import { UserDtoResponse } from 'src/users/dto/responses/user-dto.response';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { WrapperDtoResponse } from 'src/common/helpers/wrapper-dto.response';
import { EvaluationDtoResponse } from '../dto/responses/evaluation.dto.response';

@ApiTags('Evaluation')
@Controller('v1/evaluation')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 201,
    description: 'Create evaluation',
    type: EvaluationDtoResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @Post()
  create(
    @IsCustomer() customer: WrapperDtoResponse<UserDtoResponse>,
    @Body() dto: EvaluationDtoRequest,
  ): Promise<WrapperDtoResponse<EvaluationDtoResponse>> {
    return this.evaluationService.create(dto, customer);
  }

  @ApiResponse({
    status: 200,
    description: 'Search all evaluations by professional',
    type: EvaluationDtoResponse,
  })
  @ApiResponse({ status: 204, description: 'No content' })
  @Get()
  findAll(
    @Query('professionalId') professionalId: number,
  ): Promise<WrapperDtoResponse<EvaluationDtoResponse[]>> {
    return this.evaluationService.findAll(professionalId);
  }

  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Update evaluation',
    type: EvaluationDtoResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Evaluation not found' })
  @Patch(':id')
  update(
    @IsCustomer() customer: WrapperDtoResponse<UserDtoResponse>,
    @Param('id') id: string,
    @Body() updateEvaluationDto: UpdateEvaluationDto,
  ): Promise<WrapperDtoResponse<EvaluationDtoResponse>> {
    return this.evaluationService.update(customer, id, updateEvaluationDto);
  }

  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Remove job',
  })
  @ApiResponse({ status: 404, description: 'Job not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @IsCustomer() customer: WrapperDtoResponse<UserDtoResponse>,
    @Param('id') id: string,
  ) {
    return this.evaluationService.remove(customer, id);
  }
}
