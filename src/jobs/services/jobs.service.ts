import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';

import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity';
import { JobDtoRequest } from '../dto/requests/create-job-dto.request';
import { UpdateJobDtoRequest } from '../dto/requests/update-job-dto.request';
import { WrapperDtoResponse } from 'src/common/helpers/wrapper-dto.response';
import { JobDtoResponse } from '../dto/responses/job-dto.response';
import { getHttpStatusMessage } from 'src/common/helpers/http-status.mesage';
import { UserDtoResponse } from 'src/users/dto/responses/user-dto.response';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';
import { MetadataDtoResponse } from 'src/common/helpers/metadata-dto.response';
import { BusinessException } from 'src/common/errors/business-exception.error';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @Inject('JOB_REPOSITORY')
    private readonly jobRepository: Repository<Job>,
    private readonly userService: UsersService,
  ) {}

  async create(
    dto: JobDtoRequest,
    professional: UserDtoResponse,
  ): Promise<WrapperDtoResponse<JobDtoResponse>> {
    const professionalReponse = await this.userService.findOne(professional.id);

    const job: Job = {
      category: dto.category,
      description: dto.description,
      total: dto.total,
      user: professionalReponse.data as unknown as User,
    } as Job;

    this.logger.log('Saving job on database...');
    const response: Job = await this.jobRepository.save(job);
    this.logger.log('Saved.');

    return WrapperDtoResponse.of(
      this.mapper(response),
      HttpStatus.CREATED,
      getHttpStatusMessage(HttpStatus.CREATED),
    );
  }

  async findAll(userId: number): Promise<WrapperDtoResponse<JobDtoResponse[]>> {
    this.logger.log('Searching all jobs by user...');
    const response: Job[] = await this.jobRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        user: true,
      },
    });
    this.logger.log('Found.');

    if (response.length === 0) {
      return WrapperDtoResponse.empty();
    }

    return WrapperDtoResponse.of(response.map((job) => this.mapper(job)));
  }

  async findOne(
    userId: number,
    id: number,
  ): Promise<WrapperDtoResponse<JobDtoResponse>> {
    this.logger.log('Finding job by id and user...');
    const response: Job = await this.jobRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
      relations: {
        user: true,
      },
    });
    this.logger.log('Found.');

    if (!response) {
      const metadata = MetadataDtoResponse.of(
        HttpStatus.NOT_FOUND,
        getHttpStatusMessage(HttpStatus.NOT_FOUND),
        'Trabalho não localizado.',
      );

      throw new BusinessException(metadata);
    }

    return WrapperDtoResponse.of(this.mapper(response));
  }

  update(id: number, updateJobDto: UpdateJobDtoRequest) {
    return `This action updates a #${id} job`;
  }

  async remove(
    user: UserDtoResponse,
    id: number,
  ): Promise<WrapperDtoResponse<void>> {
    this.logger.log('Finding job to remove...');
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    this.logger.log('Found.');

    if (user.id !== job.user.id) {
      const metadata = MetadataDtoResponse.of(
        HttpStatus.FORBIDDEN,
        getHttpStatusMessage(HttpStatus.FORBIDDEN),
        'Usuário sem permissão para efetuar está tarefa.',
      );

      throw new BusinessException(metadata);
    }

    this.logger.log('Removing job...');
    await this.jobRepository.delete({ id: job.id });
    this.logger.log('Removed.');

    return WrapperDtoResponse.emptyWithMetadata(
      HttpStatus.NO_CONTENT,
      getHttpStatusMessage(HttpStatus.NO_CONTENT),
      null,
    );
  }

  private mapper(job: Job): JobDtoResponse {
    const response: JobDtoResponse = {
      category: job.category,
      description: job.description,
      id: job.id,
      profisionalId: job.user.id,
      total: job.total,
    };

    return response;
  }
}
