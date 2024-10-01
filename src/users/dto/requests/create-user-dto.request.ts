import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRoleEnum } from 'src/users/common/enums/user-role.enum';

export class UserDtoRequest {
  @IsNotEmpty({ message: 'Nome obrigatório' })
  @IsString({ message: 'Formato do campo nome inválido' })
  @ApiProperty()
  firstName: string;

  @IsNotEmpty({ message: 'Sobreome obrigatório' })
  @IsString({ message: 'Formato do campo sobrenome inválido' })
  @ApiProperty()
  lastName: string;

  @IsNotEmpty({ message: 'E-mail obrigatório' })
  @IsEmail({}, { message: 'Formato do campo e-mail inválido' })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Senha obrigatória' })
  @IsString({ message: 'Formato do campo senha inválido' })
  @ApiProperty()
  password: string;

  @IsNotEmpty({ message: 'Cpf ou Cnpj obrigatório' })
  @IsString({ message: 'Formato do campo cpf/cnpj inválido' })
  @ApiProperty()
  cpfCnpj: string;

  @IsNotEmpty({ message: 'Estado obrigatório' })
  @IsString({ message: 'Formato do campo estado inválido' })
  @ApiProperty()
  state: string;

  @IsNotEmpty({ message: 'Cidade obrigatória' })
  @IsString({ message: 'Formato do campo cidade inválido' })
  @ApiProperty()
  city: string;

  @IsNotEmpty({ message: 'Endereço obrigatória' })
  @IsString({ message: 'Formato do campo endereço inválido' })
  @ApiProperty()
  address: string;

  @IsNotEmpty({ message: 'Numero do endereço obrigatória' })
  @IsString({ message: 'Formato do numero do endereço inválido' })
  @ApiProperty()
  addressNumber: string;

  @IsOptional()
  @IsString({ message: 'Formato do campo complemento inválido' })
  @ApiPropertyOptional()
  complement?: string;

  @IsOptional()
  @IsString({ message: 'Formato do campo imagem Invalido' })
  @ApiPropertyOptional()
  imageUrl?: string;

  @IsOptional()
  @IsString({ message: 'Formato do campo bio Invalido' })
  @ApiPropertyOptional()
  bio?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Formato do campo nota inválido' })
  @ApiPropertyOptional()
  rating?: number;

  @IsEnum(UserRoleEnum, {
    each: true,
    message: 'Formato do campo enum inválido',
  })
  @IsArray({ message: 'Roles é uma lista' })
  @ApiProperty({
    enum: UserRoleEnum,
    examples: Object.values(UserRoleEnum),
  })
  roles: UserRoleEnum[];
}
