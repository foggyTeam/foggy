import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { getErrorMessages } from '../../errorMessages/errorMessages';
import { Types } from 'mongoose';

export class CreateBoardDto {
  @IsNotEmpty({
    message: getErrorMessages({ projectId: 'required' }).projectId,
  })
  @IsMongoId({
    message: getErrorMessages({ projectId: 'invalidType' }).projectId,
  })
  readonly projectId: Types.ObjectId;

  @IsNotEmpty({ message: getErrorMessages({ section: 'required' }).section })
  @IsMongoId({ message: getErrorMessages({ section: 'invalidType' }).section })
  readonly sectionId: Types.ObjectId;

  @IsNotEmpty({ message: getErrorMessages({ name: 'required' }).name })
  @IsString({ message: getErrorMessages({ name: 'invalidType' }).name })
  readonly name: string;

  @IsNotEmpty({ message: getErrorMessages({ type: 'required' }).type })
  @IsString({ message: getErrorMessages({ type: 'invalidType' }).type })
  readonly type: string;
}
