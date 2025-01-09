import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  userIdentifier: string;

  @IsNotEmpty()
  password: string;
}
