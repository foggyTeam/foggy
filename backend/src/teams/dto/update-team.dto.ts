import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TeamSettingsDto } from './create-team.dto';

export class UpdateTeamDto {
  @ApiProperty({
    description: 'Name of the team',
    example: 'Updated Team Name',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Avatar URL of the team',
    example: 'https://example.com/new-avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: 'Team settings',
    type: TeamSettingsDto,
    required: false,
  })
  @IsOptional()
  @Type(() => TeamSettingsDto)
  settings?: TeamSettingsDto;
}
