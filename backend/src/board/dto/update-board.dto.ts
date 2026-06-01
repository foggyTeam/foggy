import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { getErrorMessages } from '../../errorMessages/errorMessages';
import { Types } from 'mongoose';

export class UpdateBoardDto {
  @IsNotEmpty({
    message: getErrorMessages({ projectId: 'required' }).projectId,
  })
  @IsMongoId({
    message: getErrorMessages({ projectId: 'invalidType' }).projectId,
  })
  readonly projectId: Types.ObjectId;

  @IsNotEmpty({
    message: getErrorMessages({ name: 'required' }).name,
  })
  @IsString({
    message: getErrorMessages({ name: 'invalidType' }).name,
  })
  readonly name: string;
}
