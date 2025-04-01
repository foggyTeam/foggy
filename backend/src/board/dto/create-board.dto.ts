import { IsNotEmpty, IsString } from 'class-validator';
import { getErrorMessages } from '../../errorMessages';

export class CreateBoardDto {
  @IsNotEmpty({
    message: getErrorMessages({ projectId: 'required' }).projectId,
  })
  @IsString({
    message: getErrorMessages({ projectId: 'invalidType' }).projectId,
  })
  projectId: string;

  @IsNotEmpty({ message: getErrorMessages({ section: 'required' }).section })
  @IsString({ message: getErrorMessages({ section: 'invalidType' }).section })
  section: string;

  @IsNotEmpty({ message: getErrorMessages({ name: 'required' }).name })
  @IsString({ message: getErrorMessages({ name: 'invalidType' }).name })
  name: string;

  @IsNotEmpty({ message: getErrorMessages({ type: 'required' }).type })
  @IsString({ message: getErrorMessages({ type: 'invalidType' }).type })
  type: string;
}
