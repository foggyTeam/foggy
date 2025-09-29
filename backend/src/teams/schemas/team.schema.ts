import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role, ROLES } from '../../shared/types/enums';

export interface TeamMemberInfo {
  id: Types.ObjectId;
  nickname: string;
  avatar: string;
  role: Role;
  joinedAt: Date;
}

export interface TeamListItem {
  id: Types.ObjectId;
  name: string;
  avatar: string;
  description?: string;
  members: TeamMemberInfo[];
  memberCount: number;
  updatedAt: Date;
}

interface TeamSettings {
  allowRequests: boolean;
  isPublic: boolean;
  memberListIsPublic: boolean;
}

const defaultTeamSettings: TeamSettings = {
  allowRequests: true,
  isPublic: false,
  memberListIsPublic: false,
};

interface TeamMember {
  userId: Types.ObjectId;
  role: Role;
  joinedAt: Date;
}

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ type: Object, default: defaultTeamSettings })
  settings: TeamSettings;

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ROLES, required: true },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  members: TeamMember[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }], default: [] })
  projects: Types.ObjectId[];
}

export type TeamDocument = HydratedDocument<Team> & {
  updatedAt: Date;
  createdAt: Date;
};

export const TeamSchema = SchemaFactory.createForClass(Team);
