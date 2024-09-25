import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class UserLoginDtoRequest {
  @IsNotEmpty({ message: 'E-mail obrigatório' })
  @IsEmail({}, { message: 'Formato do campo e-mail inválido' })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Senha obrigatória' })
  @IsString({ message: 'Formato do campo senha inválido' })
  @ApiProperty()
  password: string;
}
