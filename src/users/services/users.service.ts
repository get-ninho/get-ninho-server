import { HttpCode, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserDtoRequest } from '../dto/requests/create-user-dto.request';
import { UpdateUserDtoRequest } from '../dto/requests/update-user-dto.request';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserDtoResponse } from '../dto/responses/user-dto.response';
import { WrapperDtoResponse } from 'src/common/helpers/wrapper-dto.response';
import { getHttpStatusMessage } from 'src/common/helpers/http-status.mesage';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async create(
    dto: UserDtoRequest,
  ): Promise<WrapperDtoResponse<UserDtoResponse>> {
    const saltOrRounds = 10;
    const hashPass = await bcrypt.hash(dto.password, saltOrRounds);

    const newUser: User = {
      bio: dto.bio,
      cpfCnpj: dto.cpfCnpj,
      email: dto.email,
      firstName: dto.firstName,
      imageUrl: dto.imageUrl,
      lastName: dto.lastName,
      password: hashPass,
      rating: dto.rating,
      role: dto.role,
    } as User;

    const user: User = await this.userRepository.save(newUser);

    return WrapperDtoResponse.of(
      this.mapResult(user),
      HttpStatus.CREATED,
      getHttpStatusMessage(HttpStatus.CREATED),
    );
  }

  async findAll(): Promise<WrapperDtoResponse<UserDtoResponse[]>> {
    const users = await this.userRepository.find();

    if (users.length === 0) {
      return WrapperDtoResponse.empty();
    }

    return WrapperDtoResponse.of(users.map((user) => this.mapResult(user)));
  }

  async findOne(id: number): Promise<WrapperDtoResponse<UserDtoResponse>> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      return WrapperDtoResponse.emptyWithMetadata(
        HttpStatus.NOT_FOUND,
        getHttpStatusMessage(HttpStatus.NOT_FOUND),
        'Usuário não localizado.',
      );
    }

    return WrapperDtoResponse.of(this.mapResult(user));
  }

  update(id: number, updateUserDto: UpdateUserDtoRequest) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  private mapResult(user: User): UserDtoResponse {
    const response: UserDtoResponse = {
      cpfCnpj: user.cpfCnpj,
      email: user.email,
      firstName: user.firstName,
      id: user.id,
      lastName: user.lastName,
      role: user.role,
      bio: user.bio,
      imageUrl: user.imageUrl,
      rating: user.rating,
    };

    return response;
  }
}
