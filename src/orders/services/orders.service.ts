import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { OrderDtoRequest } from '../dto/requests/create-order.dto.request';
import { UpdateOrderDto } from '../dto/requests/update-order.dto';
import { ServiceOrder } from '../entities/order.entity';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';
import { PutObjectCommandInput, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from 'src/common/aws/aws.config';
import { BusinessException } from 'src/common/errors/business-exception.error';
import { getHttpStatusMessage } from 'src/common/helpers/http-status.mesage';
import { MetadataDtoResponse } from 'src/common/helpers/metadata-dto.response';
import { UserDtoResponse } from 'src/users/dto/responses/user-dto.response';
import { UsersService } from 'src/users/services/users.service';
import { JobsService } from 'src/jobs/services/jobs.service';
import { WrapperDtoResponse } from 'src/common/helpers/wrapper-dto.response';
import { JobDtoResponse } from 'src/jobs/dto/responses/job-dto.response';
import { OrderDtoResponse } from '../dto/responses/order.dto.response';
import { ImageDtoResponse } from '../dto/responses/image.dto.reponse';
import * as moment from 'moment-timezone';
import { OrderStatusEnum } from '../common/enums/order-status.enum';
import { PaymentStatusEnum } from '../common/enums/payment-status.enum';
import { Job } from 'src/jobs/entities/job.entity';
import { User } from 'src/users/entities/user.entity';
import { UserRoleEnum } from 'src/users/common/enums/user-role.enum';
import { PaginationDtoResponse } from 'src/common/helpers/pagination-dto.response';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject('SERVICE_ORDER_REPOSITORY')
    private readonly orderRepository: Repository<ServiceOrder>,

    @Inject('IMAGE_REPOSITORY')
    private readonly imageRepository: Repository<Image>,

    private readonly userService: UsersService,
    private readonly jobService: JobsService,
  ) {}

  async create(
    user: WrapperDtoResponse<UserDtoResponse>,
    dto: OrderDtoRequest,
    files: Array<Express.Multer.File>,
  ): Promise<WrapperDtoResponse<OrderDtoResponse>> {
    if (user.data.id === parseInt(dto.professionalId)) {
      const metadata = MetadataDtoResponse.of(
        HttpStatus.CONFLICT,
        getHttpStatusMessage(HttpStatus.CONFLICT),
        'Não pode realizar a compra do próprio serviço.',
      );

      throw new BusinessException(metadata);
    }

    const professional: WrapperDtoResponse<UserDtoResponse> =
      await this.userService.findOne(parseInt(dto.professionalId));

    if (!professional.data) {
      throw new BusinessException(professional.metadata);
    }

    const job: WrapperDtoResponse<JobDtoResponse> =
      await this.jobService.findOne(
        parseInt(dto.professionalId),
        parseInt(dto.jobId),
      );

    if (!job.data) {
      throw new BusinessException(job.metadata);
    }

    const paymentStatus: PaymentStatusEnum = PaymentStatusEnum.PENDENTE;
    //TODO: Chamar método para processar o pagamento aqui e alterar o PaymentStatus

    const order: ServiceOrder = {
      customer: user.data as unknown as User,
      job: job.data as unknown as Job,
      professional: professional.data as unknown as User,
      orderStatus: OrderStatusEnum.AGENDADO,
      paymentForm: dto.paymentForm,
      paymentStatus: paymentStatus,
      total: job.data.total,
      images: [],
    } as ServiceOrder;

    this.logger.log('Saving service order on database...');
    const savedOrder: ServiceOrder = await this.orderRepository.save(order);
    this.logger.log('Saved.');

    if (files.length > 0) {
      const imagesUrls: string[] = await this.uploadFilesToS3(files);

      const imagesToSave = imagesUrls.map((url) => {
        const image: Image = {
          imageUrl: url,
          serviceOrder: savedOrder,
        } as Image;

        this.logger.log('Saving service order images on database...');
        return this.imageRepository.save(image);
      });

      await Promise.all(imagesToSave);
    }

    const completeOrder = await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: {
        images: true,
        customer: true,
        professional: true,
        job: true,
      },
    });

    return WrapperDtoResponse.of(this.mapResult(completeOrder));
  }

  async findAll(
    user: WrapperDtoResponse<UserDtoResponse>,
    page: number,
    limit: number,
  ): Promise<WrapperDtoResponse<OrderDtoResponse[]>> {
    if (user.data.roles.includes(UserRoleEnum.PRESTADOR)) {
      this.logger.log('Searching all service orders by professional...');

      const [orders, total] = await this.orderRepository.findAndCount({
        where: {
          professional: {
            id: user.data.id,
          },
        },
        relations: {
          customer: true,
          job: true,
          images: true,
          professional: true,
        },
        take: limit,
        skip: (page - 1) * limit,
      });

      this.logger.log('Found.');

      const pagination = PaginationDtoResponse.of(limit, page, total);

      return WrapperDtoResponse.of(
        orders.map((order) => this.mapResult(order)),
        HttpStatus.OK,
        getHttpStatusMessage(HttpStatus.OK),
        undefined,
        pagination,
      );
    } else {
      this.logger.log('Searching all service orders by customer...');

      const [orders, total] = await this.orderRepository.findAndCount({
        where: {
          customer: {
            id: user.data.id,
          },
        },
        relations: {
          customer: true,
          job: true,
          images: true,
          professional: true,
        },
        take: limit,
        skip: (page - 1) * limit,
      });

      this.logger.log('Found.');

      const pagination = PaginationDtoResponse.of(limit, page, total);

      return WrapperDtoResponse.of(
        orders.map((order) => this.mapResult(order)),
        HttpStatus.OK,
        getHttpStatusMessage(HttpStatus.OK),
        undefined,
        pagination,
      );
    }
  }

  async findOne(
    user: WrapperDtoResponse<UserDtoResponse>,
    id: number,
  ): Promise<WrapperDtoResponse<OrderDtoResponse>> {
    this.logger.log('Finding service order by user and id...');
    const order: ServiceOrder = await this.orderRepository.findOne({
      where: {
        id,
        customer: {
          id: user.data.id,
        },
      },
      relations: {
        customer: true,
        professional: true,
        images: true,
        job: true,
      },
    });
    this.logger.log('Found.');

    return WrapperDtoResponse.of(this.mapResult(order));
  }

  async update(
    id: number,
    dto: UpdateOrderDto,
    user: WrapperDtoResponse<UserDtoResponse>,
    files: Array<Express.Multer.File>,
  ): Promise<WrapperDtoResponse<OrderDtoResponse>> {
    this.logger.log('Finding service order by user and id...');
    const order: ServiceOrder = await this.orderRepository.findOne({
      where: {
        id,
        customer: {
          id: user.data.id,
        },
      },
      relations: {
        customer: true,
        professional: true,
        images: true,
        job: true,
      },
    });
    this.logger.log('Found.');

    if (!order) {
      const metadata = MetadataDtoResponse.of(
        HttpStatus.FORBIDDEN,
        getHttpStatusMessage(HttpStatus.FORBIDDEN),
        'Você não tem permissão para finalizar este serviço.',
      );

      throw new BusinessException(metadata);
    }

    if (!order.finishedDate) {
      order.finishedDate = new Date();
    }

    if (files.length > 0) {
      const imagesUrls: string[] = await this.uploadFilesToS3(files);

      const imagesToSave = imagesUrls.map((url) => {
        const image: Image = {
          imageUrl: url,
          serviceOrder: order,
        } as Image;

        this.logger.log('Saving service order images on database...');
        return this.imageRepository.save(image);
      });

      await Promise.all(imagesToSave);
    }

    Object.assign(order, dto);

    this.logger.log('Updating order...');
    const savedOrder: ServiceOrder = await this.orderRepository.save(order);
    this.logger.log('Updated.');

    const completeOrder = await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: {
        images: true,
        customer: true,
        professional: true,
        job: true,
      },
    });

    return WrapperDtoResponse.of(this.mapResult(completeOrder));
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  private async uploadFilesToS3(
    files: Array<Express.Multer.File>,
  ): Promise<string[]> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSizeInBytes = 1.5 * 1024 * 1024; // 1.5 MB
    const uploadedFileUrls: string[] = [];

    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        const metadata = MetadataDtoResponse.of(
          HttpStatus.BAD_REQUEST,
          getHttpStatusMessage(HttpStatus.BAD_REQUEST),
          'Tipo do arquivo não permitido.',
        );
        throw new BusinessException(metadata);
      }

      if (file.size > maxSizeInBytes) {
        const metadata = MetadataDtoResponse.of(
          HttpStatus.BAD_REQUEST,
          getHttpStatusMessage(HttpStatus.BAD_REQUEST),
          'Tamanho do arquivo excedido.',
        );
        throw new BusinessException(metadata);
      }

      const params: PutObjectCommandInput = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `images/works/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      try {
        this.logger.log('Processing file in aws...');
        await s3Client.send(new PutObjectCommand(params));
        this.logger.log('Finished.');

        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
        uploadedFileUrls.push(fileUrl);
      } catch (err) {
        throw new Error(`Failed to upload file: ${err}`);
      }
    }

    return uploadedFileUrls;
  }

  private mapResult(order: ServiceOrder): OrderDtoResponse {
    const images: ImageDtoResponse[] = order.images.map((image) => {
      return {
        imageUrl: image.imageUrl,
      };
    });

    const response: OrderDtoResponse = {
      customer: `${order.customer.firstName} ${order.customer.lastName}`,
      id: order.id,
      orderStatus: order.orderStatus,
      paymentForm: order.paymentForm,
      paymentStatus: order.paymentStatus,
      professional: `${order.professional.firstName} ${order.professional.lastName}`,
      service: order.job.description,
      imagesUrl: images,
      finishDate: moment(order.finishedDate)
        .tz('America/Sao_Paulo')
        .format('DD/MM/YYYY HH:mm:ss'),
      createdAt: moment(order.createdAt)
        .tz('America/Sao_Paulo')
        .format('DD/MM/YYYY HH:mm:ss'),
      updatedAt: moment(order.updatedAt)
        .tz('America/Sao_Paulo')
        .format('DD/MM/YYYY HH:mm:ss'),
    };

    return response;
  }
}
