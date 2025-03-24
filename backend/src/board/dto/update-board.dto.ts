import { IsString } from 'class-validator';

export class UpdateBoardDto {
  @IsString()
  readonly name: string;
}
