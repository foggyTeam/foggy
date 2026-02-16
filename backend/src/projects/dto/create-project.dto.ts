import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { getErrorMessages } from '../../errorMessages/errorMessages';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

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

  @ApiProperty({
    required: false,
    description: 'ID команды, для которой создается проект',
    type: String,
  })
  @IsOptional()
  @IsMongoId()
  teamId?: Types.ObjectId | null;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ProjectSettingsDto)
  settings: ProjectSettingsDto;
}
