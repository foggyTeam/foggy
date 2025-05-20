import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class ChangeSectionParentDto {
  @ApiProperty({
    description: 'ID of the new parent section (null for root)',
    example: '507f1f77bcf86cd799439011',
    type: String,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsMongoId()
  newParent: Types.ObjectId | null;
}
