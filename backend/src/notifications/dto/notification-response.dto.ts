import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../shared/types/enums';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Role to assign (only for accept action)',
    enum: Role,
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
