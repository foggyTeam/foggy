import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { getErrorMessages } from '../../errorMessages';
import { Types } from 'mongoose';

export class CreateBoardDto {
  @IsNotEmpty({
    message: getErrorMessages({ projectId: 'required' }).projectId,
  })
  @IsMongoId({
    message: getErrorMessages({ projectId: 'invalidType' }).projectId,
  })
  projectId: Types.ObjectId;

  @IsNotEmpty({ message: getErrorMessages({ section: 'required' }).section })
  @IsMongoId({ message: getErrorMessages({ section: 'invalidType' }).section })
  sectionId: Types.ObjectId;

  @IsNotEmpty({ message: getErrorMessages({ name: 'required' }).name })
  @IsString({ message: getErrorMessages({ name: 'invalidType' }).name })
  name: string;

  @IsNotEmpty({ message: getErrorMessages({ type: 'required' }).type })
  @IsString({ message: getErrorMessages({ type: 'invalidType' }).type })
  type: string;
}
