import { HttpStatus, Inject, Injectable } from '@nestjs/common';
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

  public async create(
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
      address: dto.address,
      city: dto.city,
      state: dto.state,
      addressNumber: dto.addressNumber,
      complement: dto.complement,
    } as User;

    const user: User = await this.userRepository.save(newUser);

    return WrapperDtoResponse.of(
      this.mapResult(user),
      HttpStatus.CREATED,
      getHttpStatusMessage(HttpStatus.CREATED),
    );
  }

  public async findAll(): Promise<WrapperDtoResponse<UserDtoResponse[]>> {
    const users: User[] = await this.userRepository.find();

    if (users.length === 0) {
      return WrapperDtoResponse.empty();
    }

    return WrapperDtoResponse.of(users.map((user) => this.mapResult(user)));
  }

  public async findOne(
    id: number,
  ): Promise<WrapperDtoResponse<UserDtoResponse>> {
    const user: User = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      return WrapperDtoResponse.emptyWithMetadata(
        HttpStatus.NOT_FOUND,
        getHttpStatusMessage(HttpStatus.NOT_FOUND),
        'Usuário não localizado.',
      );
    }

    return WrapperDtoResponse.of(this.mapResult(user));
  }

  public async update(
    id: number,
    dto: UpdateUserDtoRequest,
  ): Promise<WrapperDtoResponse<UserDtoResponse>> {
    const user: User = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      return WrapperDtoResponse.emptyWithMetadata(
        HttpStatus.NOT_FOUND,
        getHttpStatusMessage(HttpStatus.NOT_FOUND),
        'Usuário não localizado.',
      );
    }

    if (dto.password) {
      const saltOrRounds = 10;
      dto.password = await bcrypt.hash(dto.password, saltOrRounds);
    } else {
      dto.password = user.password;
    }

    await this.userRepository.update({ id }, dto);

    const updatedUser = await this.userRepository.findOne({ where: { id } });

    return WrapperDtoResponse.of(this.mapResult(updatedUser));
  }

  public async remove(id: number): Promise<WrapperDtoResponse<void>> {
    const user: User = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      return WrapperDtoResponse.emptyWithMetadata(
        HttpStatus.NOT_FOUND,
        getHttpStatusMessage(HttpStatus.NOT_FOUND),
        'Usuário não localizado.',
      );
    }

    await this.userRepository.delete({ id: user.id });

    return WrapperDtoResponse.emptyWithMetadata(
      HttpStatus.NO_CONTENT,
      getHttpStatusMessage(HttpStatus.NO_CONTENT),
      null,
    );
  }

  public async getUserByEmail(
    email: string,
    password: string,
  ): Promise<WrapperDtoResponse<User>> {
    const user: User = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return WrapperDtoResponse.emptyWithMetadata(
        HttpStatus.UNAUTHORIZED,
        getHttpStatusMessage(HttpStatus.UNAUTHORIZED),
        'E-mail ou senha inválido.',
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return WrapperDtoResponse.emptyWithMetadata(
        HttpStatus.UNAUTHORIZED,
        getHttpStatusMessage(HttpStatus.UNAUTHORIZED),
        'E-mail ou senha inválido.',
      );
    }

    return WrapperDtoResponse.of(user);
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
      address: user.address,
      city: user.city,
      state: user.state,
      addressNumber: user.addressNumber,
      complement: user.complement,
    };

    return response;
  }
}
