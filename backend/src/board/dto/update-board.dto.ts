import { IsString } from 'class-validator';
import { getErrorMessages } from '../../errorMessages/errorMessages';

export class UpdateBoardDto {
  @IsString({
    message: getErrorMessages({ name: 'invalidType' }).name,
  })
  readonly name: string;
}
