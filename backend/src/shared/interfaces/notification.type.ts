import { Types } from 'mongoose';
import { EntityType, NotificationType, Role } from '../types/enums';

export interface NotificationResponse {
  id: Types.ObjectId;
  type: NotificationType;
  initiator:
    | {
        type: EntityType.USER;
        id: Types.ObjectId;
        nickname: string;
      }
    | {
        type: EntityType.PROJECT;
        id: Types.ObjectId;
        name: string;
      }
    | {
        type: Exclude<EntityType, EntityType.USER | EntityType.PROJECT>;
        id: Types.ObjectId;
      }
    | null;
  target:
    | {
        type: EntityType.USER;
        id: Types.ObjectId;
        nickname: string;
      }
    | {
        type: EntityType.PROJECT;
        id: Types.ObjectId;
        name: string;
      }
    | {
        type: Exclude<EntityType, EntityType.USER | EntityType.PROJECT>;
        id: Types.ObjectId;
      }
    | null;
  metadata: NotificationMetadata;
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
  responseMessage?: string;
  originalRequestId?: Types.ObjectId;
}

export type NotificationMetadata =
  | JoinRequestMetadata
  | InviteMetadata
  | JoinResponseMetadata;
