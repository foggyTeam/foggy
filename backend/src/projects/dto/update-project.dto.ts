import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { getErrorMessages } from '../../errorMessages/errorMessages';
import { ProjectSettingsDto } from './create-project.dto';

export class UpdateProjectDto {
  @IsOptional()
  @IsString({ message: getErrorMessages({ name: 'invalidType' }).name })
  @IsNotEmpty({ message: getErrorMessages({ name: 'required' }).name })
  name?: string;

  @IsOptional()
  @IsString({ message: getErrorMessages({ avatar: 'invalidType' }).avatar })
  avatar?: string;

  @IsOptional()
  @IsString({
    message: getErrorMessages({ project: 'invalidDescription' }).project,
  })
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectSettingsDto)
  settings?: ProjectSettingsDto;
}
