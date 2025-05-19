import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

const ROLES = ['owner', 'admin', 'editor', 'reader'] as const;
export type Role = (typeof ROLES)[number];

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
        role: { type: ROLES },
      },
    ],
    default: [],
  })
  accessControlUsers: AccessControlUser[];

  @Prop({
    type: [
      {
        teamId: { type: Types.ObjectId, ref: 'Team' },
        role: { type: ROLES },
        individualOverrides: [
          {
            userId: { type: Types.ObjectId, ref: 'User' },
            role: { type: ROLES },
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

export type ProjectDocument = HydratedDocument<Project>;

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ 'accessControlUsers.userId': 1 });
