import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { getErrorMessage } from '../errorMessages';

export class CreateUserDto {
  @IsNotEmpty({ message: getErrorMessage('nickname', 'required') })
  @IsString({ message: getErrorMessage('nickname', 'invalidType') })
  @MinLength(3, { message: getErrorMessage('nickname', 'minLength') })
  @MaxLength(20, { message: getErrorMessage('nickname', 'maxLength') })
  nickname: string;

  @IsNotEmpty({ message: getErrorMessage('email', 'required') })
  @IsEmail({}, { message: getErrorMessage('email', 'invalid') })
  email: string;

  @IsNotEmpty({ message: getErrorMessage('password', 'required') })
  @IsString({ message: getErrorMessage('password', 'invalidType') })
  @MinLength(8, { message: getErrorMessage('password', 'minLength') })
  @MaxLength(20, { message: getErrorMessage('password', 'maxLength') })
  @Matches(/[A-Za-z]/, { message: getErrorMessage('password', 'containsLetter') })
  @Matches(/[0-9]/, { message: getErrorMessage('password', 'containsNumber') })
  password: string;
}