import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateSectionDto {
  @ApiProperty({
    description: 'Name of the section',
    example: 'New Section',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ID of the parent section (optional)',
    example: '507f1f77bcf86cd799439011',
    required: false,
    nullable: true,
  })
  @IsOptional()
  parentSectionId?: Types.ObjectId | null;
}
