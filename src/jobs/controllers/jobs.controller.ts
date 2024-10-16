import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobsService } from '../services/jobs.service';
import { JobDtoRequest } from '../dto/requests/create-job-dto.request';
import { UpdateJobDtoRequest } from '../dto/requests/update-job-dto.request';
import { IsPrestador } from 'src/common/decorators/prestador.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserDtoResponse } from 'src/users/dto/responses/user-dto.response';
import { WrapperDtoResponse } from 'src/common/helpers/wrapper-dto.response';
import { JobDtoResponse } from '../dto/responses/job-dto.response';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { DatabaseErrorInterceptor } from 'src/common/errors/database-error.interceptor';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRoleEnum } from 'src/users/common/enums/user-role.enum';
import { RolesGuard } from 'src/common/guards/role.guard';

@ApiTags('jobs')
@UseInterceptors(DatabaseErrorInterceptor)
@Controller('v1/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.PRESTADOR)
  @ApiResponse({
    status: 201,
    description: 'Create job',
    type: UserDtoResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @Post()
  create(
    @IsPrestador() user: WrapperDtoResponse<UserDtoResponse>,
    @Body() createJobDto: JobDtoRequest,
  ): Promise<WrapperDtoResponse<JobDtoResponse>> {
    return this.jobsService.create(createJobDto, user);
  }

  @ApiResponse({
    status: 200,
    description: 'Search all jobs by professional',
    type: UserDtoResponse,
  })
  @ApiResponse({ status: 204, description: 'No content' })
  @Get()
  findAll(
    @Query('userId') userId: number,
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
  ): Promise<WrapperDtoResponse<JobDtoResponse[]>> {
    return this.jobsService.findAll(userId, page, size);
  }

  @ApiResponse({
    status: 200,
    description: 'Find job by professional and id',
    type: UserDtoResponse,
  })
  @ApiResponse({ status: 404, description: 'Job not found.' })
  @Get(':id')
  findOne(
    @Query('userId') userId: number,
    @Param('id') id: string,
  ): Promise<WrapperDtoResponse<JobDtoResponse>> {
    return this.jobsService.findOne(userId, +id);
  }

  @ApiResponse({
    status: 200,
    description: 'Update job',
    type: JobDtoResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDtoRequest) {
    return this.jobsService.update(+id, updateJobDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.PRESTADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description: 'Remove job',
  })
  @ApiResponse({ status: 404, description: 'Job not found.' })
  @Delete(':id')
  remove(
    @IsPrestador() user: UserDtoResponse,
    @Param('id') id: string,
  ): Promise<WrapperDtoResponse<void>> {
    return this.jobsService.remove(user, +id);
  }
}
