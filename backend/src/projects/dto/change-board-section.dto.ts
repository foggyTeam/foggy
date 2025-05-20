import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class ChangeBoardSectionDto {
  @ApiProperty({
    description: 'ID of the new section',
    example: '507f1f77bcf86cd799439011',
    type: String,
  })
  @IsNotEmpty()
  @IsMongoId()
  newSectionId: Types.ObjectId;
}
