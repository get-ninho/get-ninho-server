import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
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
  @IsString()
  @ApiProperty()
  firstName: string;

  @IsNotEmpty({ message: 'Sobreome obrigatório' })
  @IsString()
  @ApiProperty()
  lastName: string;

  @IsNotEmpty({ message: 'E-mail obrigatório' })
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Senha obrigatória' })
  @IsString()
  @ApiProperty()
  password: string;

  @IsNotEmpty({ message: 'Cpf ou Cnpj obrigatório' })
  @IsString()
  @ApiProperty()
  cpfCnpj: string;

  @IsOptional()
  @IsString({ message: 'Formato Invalido' })
  @ApiPropertyOptional()
  imageUrl?: string;

  @IsOptional()
  @IsString({ message: 'Formato Invalido' })
  @ApiPropertyOptional()
  bio?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  rating?: number;

  @IsEnum(UserRoleEnum)
  @ApiProperty({
    enum: UserRoleEnum,
    examples: Object.keys(UserRoleEnum),
  })
  role: UserRoleEnum;
}
