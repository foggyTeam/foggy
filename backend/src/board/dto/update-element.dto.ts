import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateElementDto {
  @IsOptional()
  @IsBoolean()
  readonly draggable?: boolean;

  @IsOptional()
  @IsNumber()
  readonly dragDistance?: number;

  @IsOptional()
  @IsNumber()
  readonly x?: number;

  @IsOptional()
  @IsNumber()
  readonly y?: number;

  @IsOptional()
  @IsNumber()
  readonly rotation?: number;

  @IsOptional()
  @IsString()
  readonly fill?: string;

  @IsOptional()
  @IsString()
  readonly stroke?: string;

  @IsOptional()
  @IsNumber()
  readonly strokeWidth?: number;

  @IsOptional()
  @IsNumber()
  readonly cornerRadius?: number;

  @IsOptional()
  @IsNumber()
  readonly width?: number;

  @IsOptional()
  @IsNumber()
  readonly height?: number;

  @IsOptional()
  @IsString()
  readonly svg?: string;

  @IsOptional()
  @IsString()
  readonly content?: string;

  @IsOptional()
  readonly points?: number[];

  @IsOptional()
  @IsNumber()
  readonly opacity?: number;
}
