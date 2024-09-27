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

@ApiTags('jobs')
@UseInterceptors(DatabaseErrorInterceptor)
@Controller('v1/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.PRESTADOR)
  @ApiResponse({
    status: 201,
    description: 'Create job',
    type: UserDtoResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @Post()
  create(
    @IsPrestador() user: UserDtoResponse,
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
  ): Promise<WrapperDtoResponse<JobDtoResponse[]>> {
    return this.jobsService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Query('userId') userId: number,
    @Param('id') id: string,
  ): Promise<WrapperDtoResponse<JobDtoResponse>> {
    return this.jobsService.findOne(userId, +id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDtoRequest) {
    return this.jobsService.update(+id, updateJobDto);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.PRESTADOR)
  @Delete(':id')
  remove(
    @IsPrestador() user: UserDtoResponse,
    @Param('id') id: string,
  ): Promise<WrapperDtoResponse<void>> {
    return this.jobsService.remove(user, +id);
  }
}
