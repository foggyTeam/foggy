import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSectionDto {
  @ApiProperty({
    description: 'New name of the section',
    example: 'Updated Section Name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
