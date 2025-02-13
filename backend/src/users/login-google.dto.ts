import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { getErrorMessages } from '../errorMessages';

export class GoogleUserDto {
  @IsNotEmpty({ message: getErrorMessages({ email: 'required' }).email })
  @IsEmail({}, { message: getErrorMessages({ email: 'invalidType' }).email })
  email: string;

  @IsNotEmpty({ message: getErrorMessages({ nickname: 'required' }).nickname })
  @IsString({ message: getErrorMessages({ nickname: 'invalidType' }).nickname })
  nickname: string;
}
