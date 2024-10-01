import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserDtoRequest } from '../dto/requests/create-user-dto.request';
import { UpdateUserDtoRequest } from '../dto/requests/update-user-dto.request';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserDtoResponse } from '../dto/responses/user-dto.response';
import { WrapperDtoResponse } from 'src/common/helpers/wrapper-dto.response';
import { getHttpStatusMessage } from 'src/common/helpers/http-status.mesage';
import * as moment from 'moment-timezone';
import { UserRoleEnum } from '../common/enums/user-role.enum';
import { Role } from '../entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,

    @Inject('ROLE_REPOSITORY')
    private readonly roleRepository: Repository<Role>,
  ) {}

  public async create(
    dto: UserDtoRequest,
  ): Promise<WrapperDtoResponse<UserDtoResponse>> {
    const documentExists = await this.userRepository.findOne({
      where: { cpfCnpj: dto.cpfCnpj },
    });

    if (documentExists) {
      return WrapperDtoResponse.emptyWithMetadata(
        HttpStatus.CONFLICT,
        getHttpStatusMessage(HttpStatus.CONFLICT),
        'Cpf ou cnpj já cadastrado.',
      );
    }

    const saltOrRounds = 10;
    const hashPass = await bcrypt.hash(dto.password, saltOrRounds);

    if (dto.roles.includes(UserRoleEnum.PRESTADOR)) {
      dto.roles.push(UserRoleEnum.CLIENTE);
    }

    const rolesToSave = dto.roles.map((role) => {
      const newRole = new Role();
      newRole.role = role;
      return newRole;
    });

    const savedRoles = await this.roleRepository.save(rolesToSave);

    const newUser: User = {
      bio: dto.bio,
      cpfCnpj: dto.cpfCnpj,
      email: dto.email,
      firstName: dto.firstName,
      imageUrl: dto.imageUrl,
      lastName: dto.lastName,
      password: hashPass,
      rating: dto.rating,
      roles: savedRoles,
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
    const users: User[] = await this.userRepository.find({
      relations: { roles: true },
    });

    if (users.length === 0) {
      return WrapperDtoResponse.empty();
    }

    return WrapperDtoResponse.of(users.map((user) => this.mapResult(user)));
  }

  public async findOne(
    id: number,
  ): Promise<WrapperDtoResponse<UserDtoResponse>> {
    const user: User = await this.userRepository.findOne({
      where: { id },
      relations: { roles: true },
    });

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
    if (dto.cpfCnpj) {
      return WrapperDtoResponse.emptyWithMetadata(
        HttpStatus.BAD_REQUEST,
        getHttpStatusMessage(HttpStatus.BAD_REQUEST),
        'Usuário não pode alterar o cpf/cnpj.',
      );
    }

    const user: User = await this.userRepository.findOne({
      where: { id },
      relations: { roles: true },
    });

    if (!user) {
      return WrapperDtoResponse.emptyWithMetadata(
        HttpStatus.NOT_FOUND,
        getHttpStatusMessage(HttpStatus.NOT_FOUND),
        'Usuário não localizado.',
      );
    }

    if (dto.password) {
      const saltOrRounds = 10;
      user.password = await bcrypt.hash(dto.password, saltOrRounds);
    }

    Object.assign(user, dto);

    await this.userRepository.save(user);

    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: { roles: true },
    });

    return WrapperDtoResponse.of(this.mapResult(updatedUser));
  }

  public async remove(id: number): Promise<WrapperDtoResponse<void>> {
    const user: User = await this.userRepository.findOne({
      where: { id },
      relations: { roles: true },
    });

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
    const user: User = await this.userRepository.findOne({
      where: { email },
      relations: { roles: true },
    });

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
    const roles: UserRoleEnum[] = user.roles.map((role) => role.role);

    const response: UserDtoResponse = {
      cpfCnpj: user.cpfCnpj,
      email: user.email,
      firstName: user.firstName,
      id: user.id,
      lastName: user.lastName,
      roles: roles,
      bio: user.bio,
      imageUrl: user.imageUrl,
      rating: user.rating,
      address: user.address,
      city: user.city,
      state: user.state,
      addressNumber: user.addressNumber,
      complement: user.complement,
      createdAt: moment(user.createdAt)
        .tz('America/Sao_Paulo')
        .format('DD/MM/YYYY HH:mm:ss'),
      updatedAt: moment(user.updatedAt)
        .tz('America/Sao_Paulo')
        .format('DD/MM/YYYY HH:mm:ss'),
    };

    return response;
  }
}
