import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role, ROLES } from '../../shared/types/enums';

export interface MemberInfo {
  id: Types.ObjectId;
  nickname: string;
  avatar: string;
  role: Role;
  team?: string;
  teamId?: Types.ObjectId;
}

export interface ProjectListItem {
  id: Types.ObjectId;
  name: string;
  avatar: string;
  description?: string;
  members: MemberInfo[];
  updatedAt: Date;
}

export interface ChildBoard {
  id: Types.ObjectId;
  sectionId: Types.ObjectId;
  name: string;
  type: string;
  updatedAt: Date;
}

export interface ChildSection {
  id: Types.ObjectId;
  parentId: Types.ObjectId | null;
  name: string;
  childrenNumber: number;
  children: Array<ChildSection | ChildBoard>;
}

export interface ExtendedProjectListItem extends ProjectListItem {
  settings: ProjectSettings;
  sections: ChildSection[];
}

interface AccessControlUser {
  userId: Types.ObjectId;
  role: Role;
}

interface AccessControlTeam {
  teamId: Types.ObjectId;
  role: Role;
  individualOverrides: AccessControlUser[];
}

interface ProjectSettings {
  allowRequests: boolean;
  isPublic: boolean;
  memberListIsPublic: boolean;
}

const defaultSettings: ProjectSettings = {
  allowRequests: true,
  isPublic: false,
  memberListIsPublic: false,
};

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ type: Object, default: defaultSettings })
  settings: ProjectSettings;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Section' }],
    default: [],
  })
  sections: Types.ObjectId[];

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ROLES },
      },
    ],
    default: [],
  })
  accessControlUsers: AccessControlUser[];

  @Prop({
    type: [
      {
        teamId: { type: Types.ObjectId, ref: 'Team' },
        role: { type: String, enum: ROLES },
        individualOverrides: [
          {
            userId: { type: Types.ObjectId, ref: 'User' },
            role: { type: String, enum: ROLES },
          },
        ],
      },
    ],
    default: [],
  })
  accessControlTeams: AccessControlTeam[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ChangeLog' }] })
  changeLogs: Types.ObjectId[];
}

export type ProjectDocument = HydratedDocument<Project> & {
  updatedAt: Date;
  createdAt: Date;
};

export const ProjectSchema = SchemaFactory.createForClass(Project);
