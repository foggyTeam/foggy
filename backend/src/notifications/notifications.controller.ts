import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { NotificationService } from './notifications.service';
import { Role } from '../shared/types/enums';
import { NotificationResponse } from '../shared/interfaces/notification.type';
import { JoinRequestDto } from './dto/join-request.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'Current user ID',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns user notifications',
  })
  async getUserNotifications(
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<NotificationResponse[]> {
    return this.notificationService.getUserNotifications(userId);
  }

  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get count of unread notifications for user' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'Current user ID',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns count of unread notifications',
    schema: {
      type: 'object',
      properties: {
        notificationCount: { type: 'number' },
      },
    },
  })
  async getUnreadNotificationCount(
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<{ notificationCount: number }> {
    const count = await this.notificationService.getUnreadNotificationCount(
      new Types.ObjectId(userId),
    );
    return { notificationCount: count };
  }

  @Post('project-invite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create project invite notification' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID of the user who initiates the invite',
    required: true,
  })
  @ApiBody({
    description: 'Project invite data',
    schema: {
      type: 'object',
      properties: {
        recipientId: { type: 'string', description: 'ID of the recipient' },
        projectId: { type: 'string', description: 'ID of the project' },
        role: {
          type: 'string',
          enum: Object.values(Role),
          description: 'Role to assign',
        },
        expiresAt: {
          type: 'string',
          format: 'date-time',
          description: 'Expiration date of the invite',
        },
      },
      required: ['recipientId', 'projectId', 'role'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Project invite notification created',
  })
  async createProjectInvite(
    @Headers('x-user-id') inviterId: Types.ObjectId,
    @Body('recipientId') recipientId: Types.ObjectId,
    @Body('projectId') projectId: Types.ObjectId,
    @Body('role') role: Role,
    @Body('expiresAt') expiresAt?: Date,
  ) {
    return this.notificationService.createProjectInvite(
      new Types.ObjectId(recipientId),
      new Types.ObjectId(projectId),
      new Types.ObjectId(inviterId),
      role,
      expiresAt,
    );
  }

  @Post('team-invite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create team invite notification' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID of the user who initiates the invite',
    required: true,
  })
  @ApiBody({
    description: 'Team invite data',
    schema: {
      type: 'object',
      properties: {
        recipientId: { type: 'string', description: 'ID of the recipient' },
        teamId: { type: 'string', description: 'ID of the team' },
        role: {
          type: 'string',
          enum: Object.values(Role),
          description: 'Role to assign',
        },
        expiresAt: {
          type: 'string',
          format: 'date-time',
          description: 'Expiration date of the invite',
        },
      },
      required: ['recipientId', 'teamId', 'role'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Team invite notification created',
  })
  async createTeamInvite(
    @Headers('x-user-id') inviterId: Types.ObjectId,
    @Body('recipientId') recipientId: Types.ObjectId,
    @Body('teamId') teamId: Types.ObjectId,
    @Body('role') role: Role,
    @Body('expiresAt') expiresAt?: Date,
  ) {
    return this.notificationService.createTeamInvite(
      new Types.ObjectId(recipientId),
      new Types.ObjectId(teamId),
      new Types.ObjectId(inviterId),
      role,
      expiresAt,
    );
  }

  @Post('project-join-request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create project join request notification' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID of the user requesting to join',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Project join request notification created',
  })
  @ApiBody({ type: JoinRequestDto })
  async createProjectJoinRequest(
    @Headers('x-user-id') userId: Types.ObjectId,
    @Body() joinRequestDto: JoinRequestDto,
  ): Promise<void> {
    return this.notificationService.createProjectJoinRequest(
      userId,
      joinRequestDto,
    );
  }

  @Post('team-join-request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create team join request notification' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID of the user requesting to join',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Project join request notification created',
  })
  @ApiBody({ type: JoinRequestDto })
  async createTeamJoinRequest(
    @Headers('x-user-id') userId: Types.ObjectId,
    @Body() joinRequestDto: JoinRequestDto,
  ): Promise<void> {
    return this.notificationService.createTeamJoinRequest(
      userId,
      joinRequestDto,
    );
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Accept notification' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'Current user ID',
    required: true,
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the notification to accept',
  })
  @ApiResponse({
    status: 204,
    description: 'Notification accepted',
  })
  async acceptNotification(
    @Headers('x-user-id') userId: Types.ObjectId,
    @Param('id') notificationId: Types.ObjectId,
  ): Promise<void> {
    return this.notificationService.handleNotification(
      new Types.ObjectId(notificationId),
      new Types.ObjectId(userId),
      true,
    );
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reject notification' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'Current user ID',
    required: true,
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the notification to reject',
  })
  @ApiResponse({
    status: 204,
    description: 'Notification rejected',
  })
  async rejectNotification(
    @Headers('x-user-id') userId: Types.ObjectId,
    @Param('id') notificationId: Types.ObjectId,
  ): Promise<void> {
    return this.notificationService.handleNotification(
      new Types.ObjectId(notificationId),
      new Types.ObjectId(userId),
      false,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification for current user' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'Current user ID',
    required: true,
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the notification to delete',
  })
  @ApiResponse({
    status: 204,
    description: 'Notification deleted for user',
  })
  async deleteNotification(
    @Headers('x-user-id') userId: Types.ObjectId,
    @Param('id') notificationId: Types.ObjectId,
  ): Promise<void> {
    return this.notificationService.deleteNotification(notificationId, userId);
  }
}
