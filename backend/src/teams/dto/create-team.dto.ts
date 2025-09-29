import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class TeamSettingsDto {
  @ApiProperty({
    description: 'Allow users to require',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowRequests?: boolean;

  @ApiProperty({
    description: 'Team is publicly visible',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Team member list is publicly visible',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  memberListIsPublic?: boolean;
}

export class CreateTeamDto {
  @ApiProperty({
    description: 'Name of the team',
    example: 'Development Team',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Avatar URL of the team',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: 'Description of the team',
    example: 'Our awesome development team',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Team settings',
    type: TeamSettingsDto,
    required: false,
  })
  @IsOptional()
  @Type(() => TeamSettingsDto)
  settings?: TeamSettingsDto;
}
