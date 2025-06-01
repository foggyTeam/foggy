import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { EntityType, NotificationType, Role } from '../shared/types/enums';
import { User } from '../users/schemas/user.schema';
import { Project } from '../projects/schemas/project.schema';
import {
  InviteMetadata,
  JoinRequestMetadata,
  JoinResponseMetadata,
  NotificationMetadata,
  NotificationResponse,
} from '../shared/interfaces/notification.type';
import { ProjectService } from '../projects/project.service';
import { CustomException } from '../exceptions/custom-exception';
import { getErrorMessages } from '../errorMessages/errorMessages';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private readonly projectService: ProjectService,
  ) {}

  async getUserNotifications(
    userId: Types.ObjectId,
  ): Promise<NotificationResponse[]> {
    const notifications = await this.notificationModel
      .find({ 'recipients.userId': userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    const notificationIdsToUpdate: Types.ObjectId[] = [];

    for (const notif of notifications) {
      const recipient = notif.recipients.find((r) => r.userId.equals(userId));
      if (recipient && !recipient.isRead) {
        notificationIdsToUpdate.push(notif._id);
      }
    }
    if (notificationIdsToUpdate.length > 0) {
      await this.notificationModel.updateMany(
        { _id: { $in: notificationIdsToUpdate }, 'recipients.userId': userId },
        {
          $set: {
            'recipients.$.isRead': true,
            'recipients.$.readAt': new Date(),
          },
        },
      );
    }

    const entityIds: { [key: string]: Set<string> } = {
      [EntityType.USER]: new Set(),
      [EntityType.PROJECT]: new Set(),
    };

    for (const notif of notifications) {
      ['initiator', 'target'].forEach((field) => {
        const ref = notif[field];
        if (ref?.type === EntityType.USER) {
          entityIds[EntityType.USER].add(ref.id.toString());
        }
        if (ref?.type === EntityType.PROJECT) {
          entityIds[EntityType.PROJECT].add(ref.id.toString());
        }
      });
    }

    const users = await this.userModel
      .find({ _id: { $in: Array.from(entityIds[EntityType.USER]) } })
      .select('_id nickname')
      .lean()
      .exec();
    const projects = await this.projectModel
      .find({ _id: { $in: Array.from(entityIds[EntityType.PROJECT]) } })
      .select('_id name')
      .lean()
      .exec();

    const userMap = new Map(users.map((u) => [u._id.toString(), u.nickname]));
    const projectMap = new Map(projects.map((p) => [p._id.toString(), p.name]));

    return notifications.map((notif) => {
      const recipient = notif.recipients.find((r) => r.userId.equals(userId));

      const mapEntity = (ref: any) => {
        if (!ref) return null;
        if (ref.type === EntityType.USER) {
          return {
            type: EntityType.USER,
            id: ref.id,
            nickname: userMap.get(ref.id.toString()),
          };
        }
        if (ref.type === EntityType.PROJECT) {
          return {
            type: EntityType.PROJECT,
            id: ref.id,
            name: projectMap.get(ref.id.toString()),
          };
        }
        return {
          type: ref.type,
          id: ref.id,
        };
      };

      return {
        id: notif._id,
        type: notif.type,
        initiator: mapEntity(notif.initiator),
        target: mapEntity(notif.target),
        metadata: notif.metadata as NotificationMetadata,
        isRead: !!recipient?.isRead,
      } as NotificationResponse;
    });
  }

  async createProjectInvite(
    recipientId: Types.ObjectId,
    entityId: Types.ObjectId,
    inviterId: Types.ObjectId,
    role: Role,
    expiresAt?: Date,
  ): Promise<void> {
    await this.createInvite(
      recipientId,
      entityId,
      inviterId,
      role,
      NotificationType.PROJECT_INVITE,
      expiresAt,
    );
  }

  async createTeamInvite(
    recipientId: Types.ObjectId,
    entityId: Types.ObjectId,
    inviterId: Types.ObjectId,
    role: Role,
    expiresAt?: Date,
  ): Promise<void> {
    await this.createInvite(
      recipientId,
      entityId,
      inviterId,
      role,
      NotificationType.TEAM_INVITE,
      expiresAt,
    );
  }

  async deleteNotification(
    notificationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    const notification = await this.findNotificationById(notificationId);
    this.validateRecipient(notification, userId);

    if (notification.recipients.length === 1) {
      await this.notificationModel.findByIdAndDelete(notificationId);
    } else {
      await this.notificationModel.updateOne(
        { _id: notificationId },
        { $pull: { recipients: { userId } } },
      );
    }
  }

  async acceptNotification(
    notificationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    const notification = await this.findNotificationById(notificationId);
    this.validateRecipient(notification, userId);

    switch (notification.type) {
      case NotificationType.PROJECT_INVITE:
        await this.handleProjectInvite(notification, userId);
        break;
      case NotificationType.TEAM_INVITE:
        await this.handleTeamInvite(notification, userId);
        break;
      case NotificationType.PROJECT_JOIN_REQUEST:
        await this.handleProjectJoinRequest(notification, userId);
        break;
      case NotificationType.TEAM_JOIN_REQUEST:
        await this.handleTeamJoinRequest(notification, userId);
        break;
      default:
        throw new CustomException(
          getErrorMessages({ notification: 'unsupportedAcceptType' }),
          HttpStatus.BAD_REQUEST,
        );
    }

    await this.deleteNotification(notificationId, userId);
  }

  async createProjectJoinRequest(
    userId: Types.ObjectId,
    projectId: Types.ObjectId,
    role: Role,
    customMessage?: string,
  ): Promise<void> {
    const projectAdmins =
      await this.projectService.getProjectAdminIds(projectId);

    await new this.notificationModel({
      type: NotificationType.PROJECT_JOIN_REQUEST,
      recipients: projectAdmins.map((adminId) => ({ userId: adminId })),
      initiator: { type: EntityType.USER, id: userId },
      target: { type: EntityType.PROJECT, id: projectId },
      metadata: {
        role,
        customMessage,
      } as JoinRequestMetadata,
    }).save();
  }

  private async handleProjectJoinRequest(
    notification: NotificationDocument,
    inviterId: Types.ObjectId,
  ) {
    const userId = notification.initiator.id;
    const projectId = notification.target.id;

    await this.projectService.addUser(
      projectId,
      inviterId,
      userId,
      notification.metadata.role,
    );

    await this.notificationModel.create({
      type: NotificationType.PROJECT_JOIN_ACCEPTED,
      recipients: [{ userId }],
      initiator: { type: EntityType.USER, id: inviterId },
      target: { type: EntityType.PROJECT, id: projectId },
      metadata: {
        role: notification.metadata.role,
        inviterId: inviterId,
        source: 'request',
      } as JoinResponseMetadata,
    });

    await this.notifyProjectOnJoin(
      projectId,
      userId,
      inviterId,
      notification.metadata.role,
      'request',
    );
  }

  private async handleTeamJoinRequest(
    notification: NotificationDocument,
    inviterId: Types.ObjectId,
  ) {
    //TODO: team notification
    throw new CustomException(
      getErrorMessages({ feature: 'notImplemented' }),
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  private validateRecipient(
    notification: NotificationDocument,
    userId: Types.ObjectId,
  ): void {
    const isRecipient = notification.recipients.some((r) =>
      r.userId.equals(userId),
    );
    if (!isRecipient) {
      throw new CustomException(
        getErrorMessages({ notification: 'notRecipient' }),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private async findNotificationById(
    notificationId: Types.ObjectId,
  ): Promise<NotificationDocument> {
    const notification = await this.notificationModel
      .findById(notificationId)
      .exec();

    if (!notification) {
      throw new CustomException(
        getErrorMessages({ notification: 'notFound' }),
        HttpStatus.NOT_FOUND,
      );
    }
    return notification;
  }

  private async handleProjectInvite(
    notification: NotificationDocument,
    userId: Types.ObjectId,
  ) {
    const metadata = notification.metadata as InviteMetadata;
    const inviterId = notification.initiator.id;
    const projectId = notification.target.id;
    await this.projectService.addUser(
      projectId,
      inviterId,
      userId,
      metadata.role,
    );

    await this.notifyProjectOnJoin(
      projectId,
      userId,
      inviterId,
      metadata.role,
      'invite',
    );
  }

  private async handleTeamInvite(
    notification: NotificationDocument,
    userId: Types.ObjectId,
  ) {
    //TODO: team notification
    throw new CustomException(
      getErrorMessages({ feature: 'notImplemented' }),
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  private async createInvite(
    recipientId: Types.ObjectId,
    entityId: Types.ObjectId,
    inviterId: Types.ObjectId,
    role: Role,
    inviteType: NotificationType.PROJECT_INVITE | NotificationType.TEAM_INVITE,
    expiresAt?: Date,
  ): Promise<void> {
    const entityType =
      inviteType === NotificationType.PROJECT_INVITE
        ? EntityType.PROJECT
        : EntityType.TEAM;

    await new this.notificationModel({
      type: inviteType,
      recipients: [{ userId: recipientId }],
      initiator: { type: EntityType.USER, id: inviterId },
      target: { type: entityType, id: entityId },
      metadata: {
        role,
        expiresAt: expiresAt || this.getDefaultExpiryDate(),
      } as InviteMetadata,
    }).save();
  }

  private async notifyProjectOnJoin(
    projectId: Types.ObjectId,
    newMemberId: Types.ObjectId,
    inviterId: Types.ObjectId,
    role: Role,
    source: 'invite' | 'request',
  ) {
    const projectMembers =
      await this.projectService.getProjectMemberIds(projectId);
    const recipients = projectMembers.filter((id) => !id.equals(newMemberId));

    await this.notificationModel.create({
      type: NotificationType.PROJECT_JOIN_ACCEPTED,
      recipients: recipients.map((memberId) => ({
        userId: memberId,
      })),
      initiator: { type: EntityType.USER, id: newMemberId },
      target: { type: EntityType.PROJECT, id: projectId },
      metadata: {
        inviterId,
        role,
        source,
      } as JoinResponseMetadata,
    });
  }

  private getDefaultExpiryDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date;
  }
}
