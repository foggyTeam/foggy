import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { getErrorMessages } from '../../errorMessages/errorMessages';

class ProjectSettingsDto {
  @IsOptional()
  @IsBoolean({
    message: getErrorMessages({ settings: 'invalidType' }).settings,
  })
  allowRequests?: boolean;

  @IsOptional()
  @IsBoolean({
    message: getErrorMessages({ settings: 'invalidType' }).settings,
  })
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean({
    message: getErrorMessages({ settings: 'invalidType' }).settings,
  })
  memberListIsPublic?: boolean;
}

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
