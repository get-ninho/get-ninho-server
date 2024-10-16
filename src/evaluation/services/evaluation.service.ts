import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EvaluationDtoRequest } from '../dto/requests/create-evaluation.dto.request';
import { UpdateEvaluationDto } from '../dto/requests/update-evaluation.dto';
import { Evaluation } from '../schemas/evaluation.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JobsService } from 'src/jobs/services/jobs.service';
import { UsersService } from 'src/users/services/users.service';
import { UserDtoResponse } from 'src/users/dto/responses/user-dto.response';
import { JobDtoResponse } from 'src/jobs/dto/responses/job-dto.response';
import { WrapperDtoResponse } from 'src/common/helpers/wrapper-dto.response';
import { UpdateUserDtoRequest } from 'src/users/dto/requests/update-user-dto.request';
import { EvaluationDtoResponse } from '../dto/responses/evaluation.dto.response';
import { getHttpStatusMessage } from 'src/common/helpers/http-status.mesage';
import * as moment from 'moment-timezone';
import { MetadataDtoResponse } from 'src/common/helpers/metadata-dto.response';
import { BusinessException } from 'src/common/errors/business-exception.error';
import { PaginationDtoResponse } from 'src/common/helpers/pagination-dto.response';

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(
    @InjectModel(Evaluation.name) private evaluationModel: Model<Evaluation>,

    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly jobService: JobsService,
  ) {}

  async create(
    dto: EvaluationDtoRequest,
    customer: WrapperDtoResponse<UserDtoResponse>,
  ): Promise<WrapperDtoResponse<EvaluationDtoResponse>> {
    const professional: WrapperDtoResponse<UserDtoResponse> =
      await this.userService.findOne(dto.professionalId);

    if (!professional.data) {
      throw new BusinessException(professional.metadata);
    }

    if (customer.data.id === dto.professionalId) {
      const metadata = MetadataDtoResponse.of(
        HttpStatus.CONFLICT,
        getHttpStatusMessage(HttpStatus.CONFLICT),
        'O profissional não pode se auto avaliar.',
      );

      throw new BusinessException(metadata);
    }

    const job: WrapperDtoResponse<JobDtoResponse> =
      await this.jobService.findOne(dto.professionalId, dto.jobId);

    if (!job.data) {
      throw new BusinessException(job.metadata);
    }

    const averageRating = await this.calculateAverageRating(
      professional.data.id,
      dto.rating,
    );

    const updateRating: UpdateUserDtoRequest = {
      rating: averageRating,
    };

    await this.userService.update(
      professional.data.id,
      updateRating,
      undefined,
    );

    const evaluation = new this.evaluationModel({
      customer_id: customer.data.id,
      description: dto.description,
      job_id: job.data.id,
      professional_id: professional.data.id,
      rating: dto.rating,
    });

    this.logger.log('Saving evaluation...');
    const evaluate = await evaluation.save();
    this.logger.log('Saved.');

    return WrapperDtoResponse.of(this.mapper(evaluate));
  }

  async findAll(
    professionalId: number,
    page: number,
    limit: number,
  ): Promise<WrapperDtoResponse<EvaluationDtoResponse[]>> {
    this.logger.log('Searching all evaluations by professional...');

    const total = await this.evaluationModel
      .countDocuments({ professional_id: professionalId })
      .exec();

    const evaluations = await this.evaluationModel
      .find({ professional_id: professionalId })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    this.logger.log('Found.');

    if (evaluations.length === 0) {
      return WrapperDtoResponse.empty();
    }

    const pagination = PaginationDtoResponse.of(limit, page, total);

    return WrapperDtoResponse.of(
      evaluations.map((e) => this.mapper(e)),
      HttpStatus.OK,
      getHttpStatusMessage(HttpStatus.OK),
      undefined,
      pagination,
    );
  }

  async update(
    customer: WrapperDtoResponse<UserDtoResponse>,
    id: string,
    dto: UpdateEvaluationDto,
  ): Promise<WrapperDtoResponse<EvaluationDtoResponse>> {
    if (dto.professionalId || dto.jobId) {
      const metadata = MetadataDtoResponse.of(
        HttpStatus.BAD_REQUEST,
        getHttpStatusMessage(HttpStatus.BAD_REQUEST),
        'Não é permitido alterar o prestador ou o serviço prestado.',
      );

      throw new BusinessException(metadata);
    }

    this.logger.log('Updating evaluation...');
    const updatedEvaluation = await this.evaluationModel.findOneAndUpdate(
      {
        _id: id,
        customer_id: customer.data.id,
      },
      {
        $set: {
          ...dto,
          updated_at: moment()
            .tz('America/Sao_Paulo')
            .format('DD/MM/YYYY HH:mm:ss'),
        },
      },
      { new: true, useFindAndModify: false },
    );
    this.logger.log('Updated.');

    if (!updatedEvaluation) {
      const metadata = MetadataDtoResponse.of(
        HttpStatus.NOT_FOUND,
        getHttpStatusMessage(HttpStatus.NOT_FOUND),
        'Avaliação não localizada ou você não possui permissão para alterá-la.',
      );

      throw new BusinessException(metadata);
    }

    if (dto.rating) {
      const averageRating = await this.calculateAverageRating(
        updatedEvaluation.professional_id,
        dto.rating,
      );

      const updateRating: UpdateUserDtoRequest = {
        rating: averageRating,
      };

      await this.userService.update(
        updatedEvaluation.professional_id,
        updateRating,
        undefined,
      );
    }

    return WrapperDtoResponse.of(this.mapper(updatedEvaluation));
  }

  async remove(
    customer: WrapperDtoResponse<UserDtoResponse>,
    id: string,
  ): Promise<WrapperDtoResponse<void>> {
    this.logger.log('Removing evaluation...');
    const deleteEvaluation = await this.evaluationModel.findOneAndDelete({
      _id: id,
      customer_id: customer.data.id,
    });
    this.logger.log('Removed.');

    if (!deleteEvaluation) {
      const metadata = MetadataDtoResponse.of(
        HttpStatus.NOT_FOUND,
        getHttpStatusMessage(HttpStatus.NOT_FOUND),
        'Avaliação não localizada ou você não possui permissão para exluí-la.',
      );
      throw new BusinessException(metadata);
    }

    const averageRating = await this.calculateAverageRating(
      deleteEvaluation.professional_id,
      deleteEvaluation.rating,
    );

    const updateRating: UpdateUserDtoRequest = {
      rating: averageRating,
    };

    await this.userService.update(
      deleteEvaluation.professional_id,
      updateRating,
      undefined,
    );
    return WrapperDtoResponse.emptyWithMetadata(
      HttpStatus.NO_CONTENT,
      getHttpStatusMessage(HttpStatus.NO_CONTENT),
      null,
    );
  }

  async removeAll(id: number): Promise<void> {
    const evaluations = await this.evaluationModel.find({
      professional_id: id,
    });

    if (!evaluations || evaluations.length === 0) {
      return;
    }

    await this.evaluationModel.deleteMany({
      professional_id: id,
    });

    const totalRating = evaluations.reduce(
      (acc, evaluation) => acc + evaluation.rating,
      0,
    );
    const averageRating = totalRating / evaluations.length;

    const updateRating: UpdateUserDtoRequest = {
      rating: averageRating,
    };

    await this.userService.update(id, updateRating, undefined);
  }

  private mapper(evaluation: Evaluation): EvaluationDtoResponse {
    const response: EvaluationDtoResponse = {
      _id: String(evaluation._id),
      customerId: evaluation.customer_id,
      description: evaluation.description,
      jobId: evaluation.job_id,
      professionalId: evaluation.professional_id,
      rating: evaluation.rating,
      createdAt: evaluation.created_at,
      updatedAt: evaluation.updated_at,
    };

    return response;
  }

  private async findAllWithoutPagination(
    professionalId: number,
  ): Promise<EvaluationDtoResponse[]> {
    const evaluations = await this.evaluationModel
      .find({ professional_id: professionalId })
      .exec();

    return evaluations.map((e) => this.mapper(e));
  }

  private async calculateAverageRating(
    professionalId: number,
    newRating: number,
  ): Promise<number> {
    const allEvaluations = await this.findAllWithoutPagination(professionalId);

    const totalRatings = allEvaluations.reduce(
      (acc, evaluation) => acc + evaluation.rating,
      0,
    );

    const newTotalRatings = totalRatings + newRating;
    const numberOfRatings = allEvaluations.length + 1;

    return Math.min(Math.max(newTotalRatings / numberOfRatings, 1), 5);
  }
}
