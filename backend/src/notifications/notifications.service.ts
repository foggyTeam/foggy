import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { EntityType, NotificationType, Role } from '../shared/types/enums';
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
import { JoinRequestDto } from './dto/join-request.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ProjectService))
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
      entityIds[EntityType.USER].add(notif.initiator.toString());

      if (notif.target?.type === EntityType.USER) {
        entityIds[EntityType.USER].add(notif.target.id.toString());
      }

      if (notif.target?.type === EntityType.PROJECT) {
        entityIds[EntityType.PROJECT].add(notif.target.id.toString());
      }
    }

    const users = await this.usersService.getUserDetails(
      Array.from(entityIds[EntityType.USER]).map(
        (id) => new Types.ObjectId(id),
      ),
    );
    const projects = await this.projectService.getProjectDetails(
      Array.from(entityIds[EntityType.PROJECT]).map(
        (id) => new Types.ObjectId(id),
      ),
    );

    const userMap = new Map(
      users.map((u) => [
        u._id.toString(),
        {
          nickname: u.nickname,
          avatar: u.avatar,
        },
      ]),
    );
    const projectMap = new Map(
      projects.map((p) => [
        p._id.toString(),
        {
          name: p.name,
          avatar: p.avatar,
        },
      ]),
    );

    return notifications.map((notif) => {
      const recipient = notif.recipients.find((r) => r.userId.equals(userId));

      const mapEntity = (ref: any) => {
        if (!ref) return null;
        if (ref.type === EntityType.USER) {
          const userInfo = userMap.get(ref.id.toString());
          return {
            type: EntityType.USER,
            id: ref.id,
            nickname: userInfo?.nickname,
            avatar: userInfo?.avatar,
          };
        }
        if (ref.type === EntityType.PROJECT) {
          const projectInfo = projectMap.get(ref.id.toString());
          return {
            type: EntityType.PROJECT,
            id: ref.id,
            name: projectInfo?.name,
            avatar: projectInfo?.avatar,
          };
        }
        return {
          type: ref.type,
          id: ref.id,
        };
      };
      const initiatorInfo = userMap.get(notif.initiator.toString());

      return {
        id: notif._id,
        type: notif.type,
        initiator: {
          id: notif.initiator,
          nickname: initiatorInfo?.nickname,
          avatar: initiatorInfo?.avatar,
        },
        target: mapEntity(notif.target),
        metadata: notif.metadata as NotificationMetadata,
        createdAt: notif.createdAt,
        isRead: !!recipient?.isRead,
      } as NotificationResponse;
    });
  }

  async getUnreadNotificationCount(userId: Types.ObjectId): Promise<number> {
    return this.notificationModel.countDocuments({
      'recipients.userId': userId,
      'recipients.isRead': false,
    });
  }

  async createProjectInvite(
    recipientId: Types.ObjectId,
    entityId: Types.ObjectId,
    inviterId: Types.ObjectId,
    role: Role,
    expiresAt?: Date,
  ): Promise<void> {
    await this.projectService.findProjectById(entityId);
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
    //TODO: await this.teamService.findTeamById(entityId);
    await this.createInvite(
      recipientId,
      entityId,
      inviterId,
      role,
      NotificationType.TEAM_INVITE,
      expiresAt,
    );
  }

  async createProjectJoinRequest(
    userId: Types.ObjectId,
    joinRequestDto: JoinRequestDto,
  ): Promise<void> {
    await this.createJoinRequest(
      userId,
      joinRequestDto,
      NotificationType.PROJECT_JOIN_REQUEST,
    );
  }

  async createTeamJoinRequest(
    userId: Types.ObjectId,
    joinRequestDto: JoinRequestDto,
  ): Promise<void> {
    await this.createJoinRequest(
      userId,
      joinRequestDto,
      NotificationType.TEAM_JOIN_REQUEST,
    );
  }

  async handleNotification(
    notificationId: Types.ObjectId,
    userId: Types.ObjectId,
    isAccept: boolean,
  ): Promise<void> {
    const notification = await this.findNotificationById(notificationId);
    this.validateRecipient(notification, userId);
    switch (notification.type) {
      case NotificationType.PROJECT_INVITE:
        await this.handleProjectInvite(notification, userId, isAccept);
        break;
      case NotificationType.TEAM_INVITE:
        await this.handleTeamInvite(notification, userId, isAccept);
        break;
      case NotificationType.PROJECT_JOIN_REQUEST:
        await this.handleProjectJoinRequest(notification, userId, isAccept);
        break;
      case NotificationType.TEAM_JOIN_REQUEST:
        await this.handleTeamJoinRequest(notification, userId, isAccept);
        break;
      default:
        throw new CustomException(
          getErrorMessages({ notification: 'unsupportedResponseType' }),
          HttpStatus.BAD_REQUEST,
        );
    }

    await this.deleteNotification(notificationId, userId);
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

    await this.checkInviteDuplicate(
      inviteType,
      { type: entityType, id: entityId },
      recipientId,
    );

    await new this.notificationModel({
      type: inviteType,
      recipients: [{ userId: recipientId }],
      initiator: inviterId,
      target: { type: entityType, id: entityId },
      metadata: {
        role,
        expiresAt: expiresAt || this.getDefaultExpiryDate(),
      } as InviteMetadata,
    }).save();
  }

  private async createJoinRequest(
    userId: Types.ObjectId,
    joinRequestDto: JoinRequestDto,
    joinType:
      | NotificationType.PROJECT_JOIN_REQUEST
      | NotificationType.TEAM_JOIN_REQUEST,
  ): Promise<void> {
    const { entityId, role, customMessage } = joinRequestDto;
    const entityType =
      joinType === NotificationType.PROJECT_JOIN_REQUEST
        ? EntityType.PROJECT
        : EntityType.TEAM;

    if (entityType === EntityType.PROJECT) {
      const project = await this.projectService.findProjectById(entityId);
      if (!project?.settings?.allowRequests) {
        throw new CustomException(
          getErrorMessages({ project: 'joinRequestsDisabled' }),
          HttpStatus.FORBIDDEN,
        );
      }
    }

    await this.checkJoinDuplicate(joinType, userId, {
      type: entityType,
      id: entityId,
    });
    const adminIds =
      entityType === EntityType.PROJECT
        ? await this.projectService.getProjectAdminIds(entityId)
        : []; //TODO: team admins

    await new this.notificationModel({
      type: joinType,
      recipients: adminIds.map((adminId) => ({ userId: adminId })),
      initiator: userId,
      target: { type: entityType, id: entityId },
      metadata: {
        role,
        customMessage,
        expiresAt: this.getDefaultExpiryDate(),
      } as JoinRequestMetadata,
    }).save();
  }

  private async handleProjectInvite(
    notification: NotificationDocument,
    userId: Types.ObjectId,
    isAccept: boolean,
  ) {
    const metadata = notification.metadata as InviteMetadata;
    const inviterId = notification.initiator;
    const projectId = notification.target.id;

    if (isAccept) {
      await this.projectService.manageProjectUser(
        projectId,
        inviterId,
        userId,
        metadata.role,
        true,
      );
      await this.notifyProjectOnJoin(
        projectId,
        userId,
        inviterId,
        metadata.role,
      );
    } else {
      await this.notificationModel.create({
        type: NotificationType.PROJECT_JOIN_REJECTED,
        recipients: [{ userId: inviterId }],
        initiator: userId,
        target: { type: EntityType.PROJECT, id: projectId },
        metadata: {
          role: metadata.role,
          inviterId: inviterId,
          expiresAt: this.getDefaultExpiryDate(),
        } as JoinResponseMetadata,
      });
    }
  }

  private async handleProjectJoinRequest(
    notification: NotificationDocument,
    inviterId: Types.ObjectId,
    isAccept: boolean,
  ) {
    const metadata = notification.metadata as JoinRequestMetadata;
    const userId = notification.initiator;
    const projectId = notification.target.id;

    if (isAccept) {
      await this.projectService.manageProjectUser(
        projectId,
        inviterId,
        userId,
        metadata.role,
        true,
      );
      await this.notifyProjectOnJoin(
        projectId,
        userId,
        inviterId,
        metadata.role,
      );
    }

    await this.notificationModel.create({
      type: isAccept
        ? NotificationType.PROJECT_JOIN_ACCEPTED
        : NotificationType.PROJECT_JOIN_REJECTED,
      recipients: [{ userId }],
      initiator: inviterId,
      target: { type: EntityType.PROJECT, id: projectId },
      metadata: {
        role: metadata.role,
        inviterId: inviterId,
        expiresAt: this.getDefaultExpiryDate(),
      } as JoinResponseMetadata,
    });
  }

  private async handleTeamInvite(
    notification: NotificationDocument, // eslint-disable-line @typescript-eslint/no-unused-vars
    userId: Types.ObjectId, // eslint-disable-line @typescript-eslint/no-unused-vars
    isAccept: boolean, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    //TODO: team notification
    throw new CustomException(
      getErrorMessages({ feature: 'notImplemented' }),
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  private async handleTeamJoinRequest(
    notification: NotificationDocument, // eslint-disable-line @typescript-eslint/no-unused-vars
    inviterId: Types.ObjectId, // eslint-disable-line @typescript-eslint/no-unused-vars
    isAccept: boolean, // eslint-disable-line @typescript-eslint/no-unused-vars
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

  private async notifyProjectOnJoin(
    projectId: Types.ObjectId,
    newMemberId: Types.ObjectId,
    inviterId: Types.ObjectId,
    role: Role,
  ) {
    const projectMembers =
      await this.projectService.getProjectMemberIds(projectId);
    const membersWithSettings = await this.usersService.getUsersWithSettings(
      projectMembers.filter((id) => !id.equals(newMemberId)),
    );
    const recipients = membersWithSettings
      .filter((user) => user.settings?.projectNotifications !== false)
      .map((user) => ({ userId: user._id }));

    if (recipients.length > 0) {
      await this.notificationModel.create({
        type: NotificationType.PROJECT_MEMBER_ADDED,
        recipients,
        initiator: newMemberId,
        target: { type: EntityType.PROJECT, id: projectId },
        metadata: {
          inviterId,
          role,
          expiresAt: this.getDefaultExpiryDate(),
        } as JoinResponseMetadata,
      });
    }
  }

  private async checkInviteDuplicate(
    type: NotificationType,
    target: { type: EntityType; id: Types.ObjectId },
    recipientId: Types.ObjectId,
  ): Promise<void> {
    const existingNotification = await this.notificationModel.findOne({
      type,
      'target.type': target.type,
      'target.id': target.id,
      'recipients.userId': recipientId,
    });

    if (existingNotification) {
      throw new CustomException(
        getErrorMessages({ notification: 'inviteDuplicateExists' }),
        HttpStatus.CONFLICT,
      );
    }
  }

  private async checkJoinDuplicate(
    type: NotificationType,
    initiator: Types.ObjectId,
    target: { type: EntityType; id: Types.ObjectId },
  ): Promise<void> {
    const existingNotification = await this.notificationModel
      .findOne({
        type,
        initiator,
        'target.type': target.type,
        'target.id': target.id,
      })
      .exec();

    if (existingNotification) {
      const notificationDate = existingNotification.createdAt.getTime();
      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000;

      if (now - notificationDate < oneDayInMs) {
        throw new CustomException(
          getErrorMessages({ notification: 'joinDuplicateExists' }),
          HttpStatus.CONFLICT,
        );
      } else {
        await this.notificationModel.findByIdAndDelete(
          existingNotification._id,
        );
      }
    }
  }

  private getDefaultExpiryDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date;
  }
}
