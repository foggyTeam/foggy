import { Types } from 'mongoose';
import { EntityType, NotificationType } from '../types/enums';

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
  message?: string;
  createdAt: Date;
}

interface JoinRequestMetadata extends BaseMetadata {
  role: string;
  customMessage?: string;
}

interface InviteMetadata extends BaseMetadata {
  role: string;
  expiresAt: Date;
  inviteToken?: string;
}

interface JoinResponseMetadata extends BaseMetadata {
  responseMessage?: string;
  originalRequestId?: Types.ObjectId;
}

export type NotificationMetadata =
  | ({
      type:
        | NotificationType.PROJECT_JOIN_REQUEST
        | NotificationType.TEAM_JOIN_REQUEST;
    } & JoinRequestMetadata)
  | ({
      type: NotificationType.PROJECT_INVITE | NotificationType.TEAM_INVITE;
    } & InviteMetadata)
  | ({
      type:
        | NotificationType.PROJECT_JOIN_ACCEPTED
        | NotificationType.TEAM_JOIN_ACCEPTED
        | NotificationType.PROJECT_JOIN_REJECTED
        | NotificationType.TEAM_JOIN_REJECTED;
    } & JoinResponseMetadata);
