import { IsString } from 'class-validator';
import { getErrorMessages } from '../../errorMessages';

export class UpdateBoardDto {
  @IsString({
    message: getErrorMessages({ name: 'invalidType' }).projectId,
  })
  readonly name: string;
}
