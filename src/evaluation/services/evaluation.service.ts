import { HttpStatus, Injectable } from '@nestjs/common';
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

@Injectable()
export class EvaluationService {
  constructor(
    @InjectModel(Evaluation.name) private evaluationModel: Model<Evaluation>,
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
      return WrapperDtoResponse.emptyWithMetadata(
        professional.metadata.status,
        professional.metadata.statusText,
        professional.metadata.message,
      );
    }

    if (customer.data.id === dto.professionalId) {
      return WrapperDtoResponse.emptyWithMetadata(
        HttpStatus.CONFLICT,
        getHttpStatusMessage(HttpStatus.CONFLICT),
        'O profissional não pode se auto avaliar.',
      );
    }

    const job: WrapperDtoResponse<JobDtoResponse> =
      await this.jobService.findOne(dto.professionalId, dto.jobId);

    if (!job.data) {
      return WrapperDtoResponse.emptyWithMetadata(
        job.metadata.status,
        job.metadata.statusText,
        job.metadata.message,
      );
    }

    const averageRating = await this.calculateAverageRating(
      professional.data.id,
      dto.rating,
    );

    const updateRating: UpdateUserDtoRequest = {
      rating: averageRating,
    };

    await this.userService.update(professional.data.id, updateRating);

    const evaluation = new this.evaluationModel({
      customer_id: customer.data.id,
      description: dto.description,
      job_id: job.data.id,
      professional_id: professional.data.id,
      rating: dto.rating,
    });

    return WrapperDtoResponse.of(this.mapper(await evaluation.save()));
  }

  async findAll(
    professionalId: number,
  ): Promise<WrapperDtoResponse<EvaluationDtoResponse[]>> {
    const evaluations = await this.evaluationModel
      .find({
        professional_id: professionalId,
      })
      .exec();

    if (evaluations.length === 0) {
      return WrapperDtoResponse.empty();
    }

    return WrapperDtoResponse.of(evaluations.map((e) => this.mapper(e)));
  }

  async update(
    customer: WrapperDtoResponse<UserDtoResponse>,
    id: string,
    dto: UpdateEvaluationDto,
  ): Promise<WrapperDtoResponse<EvaluationDtoResponse>> {
    if (dto.professionalId || dto.jobId) {
      return WrapperDtoResponse.emptyWithMetadata(
        HttpStatus.BAD_REQUEST,
        getHttpStatusMessage(HttpStatus.BAD_REQUEST),
        'Não é permitido alterar o prestador ou o serviço prestado.',
      );
    }

    // Adiciona o campo updated_at à atualização
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

    if (!updatedEvaluation) {
      return WrapperDtoResponse.emptyWithMetadata(
        HttpStatus.NOT_FOUND,
        getHttpStatusMessage(HttpStatus.NOT_FOUND),
        'Avaliação não localizada ou você não possui permissão para alterá-la.',
      );
    }

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
    );

    return WrapperDtoResponse.of(this.mapper(updatedEvaluation));
  }

  async remove(
    customer: WrapperDtoResponse<UserDtoResponse>,
    id: string,
  ): Promise<WrapperDtoResponse<void>> {
    const deleteEvaluation = await this.evaluationModel.findOneAndDelete({
      _id: id,
      customer_id: customer.data.id,
    });

    if (!deleteEvaluation) {
      return WrapperDtoResponse.emptyWithMetadata(
        HttpStatus.NOT_FOUND,
        getHttpStatusMessage(HttpStatus.NOT_FOUND),
        'Avaliação não localizada ou você não possui permissão para exluí-la.',
      );
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
    );
    return WrapperDtoResponse.emptyWithMetadata(
      HttpStatus.NO_CONTENT,
      getHttpStatusMessage(HttpStatus.NO_CONTENT),
      null,
    );
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

  private async calculateAverageRating(
    professionalId: number,
    newRating: number,
  ): Promise<number> {
    const allEvaluations = await this.findAll(professionalId);

    const totalRatings = allEvaluations.data.reduce(
      (acc, evaluation) => acc + evaluation.rating,
      0,
    );

    const newTotalRatings = totalRatings + newRating;
    const numberOfRatings = allEvaluations.data.length + 1;

    return Math.min(Math.max(newTotalRatings / numberOfRatings, 1), 5);
  }
}
