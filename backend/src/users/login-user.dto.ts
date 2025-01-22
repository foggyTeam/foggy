import { IsNotEmpty, IsString } from 'class-validator';
import { getErrorMessages } from '../errorMessages';

export class LoginUserDto {
  @IsNotEmpty({ message: getErrorMessages({ email: 'required' }).email })
  @IsString({ message: getErrorMessages({ email: 'invalidType' }).email })
  email: string;

  @IsNotEmpty({ message: getErrorMessages({ password: 'required' }).password })
  @IsString({ message: getErrorMessages({ password: 'invalidType' }).password })
  password: string;
}
