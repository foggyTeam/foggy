import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { getErrorMessages } from '../../errorMessages/errorMessages';

export class CreateUserDto {
  @IsNotEmpty({ message: getErrorMessages({ email: 'required' }).email })
  @IsEmail({}, { message: getErrorMessages({ email: 'invalidType' }).email })
  email: string;

  @IsNotEmpty({
    message: getErrorMessages({ password: 'required' }).password,
  })
  @IsString({
    message: getErrorMessages({ password: 'invalidType' }).password,
  })
  @MinLength(8, {
    message: getErrorMessages({ password: 'minLength' }).password,
  })
  @MaxLength(20, {
    message: getErrorMessages({ password: 'maxLength' }).password,
  })
  @Matches(/[A-Za-z]/, {
    message: getErrorMessages({ password: 'containsLetter' }).password,
  })
  @Matches(/[0-9]/, {
    message: getErrorMessages({ password: 'containsNumber' }).password,
  })
  password: string;
}
