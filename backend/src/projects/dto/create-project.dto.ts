import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { getErrorMessages } from '../../errorMessages/errorMessages';

export class ProjectSettingsDto {
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

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ProjectSettingsDto)
  settings: ProjectSettingsDto;
}
