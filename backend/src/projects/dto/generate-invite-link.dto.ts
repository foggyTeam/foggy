import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../shared/types/enums';

const INVITE_ROLES = [Role.ADMIN, Role.EDITOR, Role.READER] as const;
export type InviteRole = (typeof INVITE_ROLES)[number];

export class GenerateInviteLinkDto {
  @ApiProperty({
    enum: INVITE_ROLES,
    description: 'Role to grant via this invite link',
    example: Role.EDITOR,
  })
  @IsEnum(INVITE_ROLES)
  role: InviteRole;

  @ApiProperty({
    type: String,
    format: 'date-time',
    required: false,
    description: 'Expiration date. Defaults to 7 days from now.',
    example: '2026-04-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
