import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role, ROLES } from '../../shared/types/enums';
import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JoinRequestDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID of the project or team to join',
    type: String,
  })
  @IsNotEmpty()
  entityId: Types.ObjectId;

  @ApiProperty({
    enum: ROLES,
    example: 'reader',
    description: 'Requested role in the project/team',
  })
  @IsNotEmpty()
  @IsIn(ROLES)
  role: Role;

  @ApiPropertyOptional({
    example: 'I would like to join because i am cool guy',
    description: 'Optional custom message for the join request',
  })
  @IsOptional()
  @IsString()
  customMessage?: string;
}
