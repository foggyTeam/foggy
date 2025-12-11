import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { Role } from '../../shared/types/enums';

export class ChangeTeamMemberRoleDto {
  @ApiProperty({
    description: 'ID of the user',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: Types.ObjectId;

  @ApiProperty({
    description: 'New role for the user',
    enum: Role,
    example: Role.EDITOR,
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
