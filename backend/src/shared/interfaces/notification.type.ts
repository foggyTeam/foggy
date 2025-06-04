import { Types } from 'mongoose';
import { EntityType, NotificationType, Role } from '../types/enums';

export interface NotificationResponse {
  id: Types.ObjectId;
  type: NotificationType;
  initiator: {
    id: Types.ObjectId;
    nickname: string;
    avatar: string;
  };
  target:
    | {
        type: EntityType.USER;
        id: Types.ObjectId;
        nickname: string;
        avatar: string;
      }
    | {
        type: EntityType.PROJECT;
        id: Types.ObjectId;
        name: string;
        avatar: string;
      }
    | {
        type: Exclude<EntityType, EntityType.USER | EntityType.PROJECT>;
        id: Types.ObjectId;
      }
    | null;
  metadata: NotificationMetadata;
  createdAt: Date;
  isRead: boolean;
}

export interface Recipient {
  userId: Types.ObjectId;
  isRead: boolean;
  readAt: Date | null;
}

export interface EntityReference {
  type: EntityType;
  id: Types.ObjectId;
}

interface BaseMetadata {
  expiresAt: Date;
}

export interface JoinRequestMetadata extends BaseMetadata {
  role: Role;
  customMessage?: string;
}

export interface InviteMetadata extends BaseMetadata {
  role: Role;
}

export interface JoinResponseMetadata extends BaseMetadata {
  role: Role;
  inviterId: Types.ObjectId;
}

export type NotificationMetadata =
  | JoinRequestMetadata
  | InviteMetadata
  | JoinResponseMetadata;
