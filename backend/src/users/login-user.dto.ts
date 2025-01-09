import { IsNotEmpty, IsString } from 'class-validator';
import { getErrorMessage } from '../errorMessages';

export class LoginUserDto {
  @IsNotEmpty({ message: getErrorMessage('general', 'required') })
  @IsString({ message: getErrorMessage('general', 'invalidType') })
  userIdentifier: string;

  @IsNotEmpty({ message: getErrorMessage('password', 'required') })
  @IsString({ message: getErrorMessage('password', 'invalidType') })
  password: string;
}
