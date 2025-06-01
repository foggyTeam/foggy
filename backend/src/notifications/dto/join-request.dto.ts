import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role, ROLES } from '../../shared/types/enums';
import { Types } from 'mongoose';

export class JoinRequestDto {
  @IsNotEmpty()
  entityId: Types.ObjectId;

  @IsNotEmpty()
  @IsIn(ROLES)
  role: Role;

  @IsOptional()
  @IsString()
  customMessage?: string;
}
