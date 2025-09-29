import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Team,
  TeamDocument,
  TeamListItem,
  TeamMemberInfo,
} from './schemas/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ChangeTeamMemberRoleDto } from './dto/change-team-member-role.dto';
import { UsersService } from '../users/users.service';
import { CustomException } from '../exceptions/custom-exception';
import { getErrorMessages } from '../errorMessages/errorMessages';
import { Role, RoleLevel } from '../shared/types/enums';
import { NotificationService } from '../notifications/notifications.service';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  async createTeam(
    createTeamDto: CreateTeamDto,
    ownerId: Types.ObjectId,
  ): Promise<Types.ObjectId> {
    try {
      await this.validateUser(ownerId);

      const newTeam = new this.teamModel({
        ...createTeamDto,
        members: [
          {
            userId: ownerId,
            role: Role.OWNER,
            joinedAt: new Date(),
          },
        ],
      });
      await this.saveTeam(newTeam);
      return newTeam._id;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTeamById(
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<TeamDocument> {
    await this.validateUser(userId);
    await this.validateTeamAccess(teamId, userId, Role.READER);

    return this.teamModel
      .findById(teamId)
      .orFail(() => this.notFoundError())
      .exec();
  }

  async getUserTeams(userId: Types.ObjectId): Promise<TeamListItem[]> {
    await this.validateUser(userId);

    const teams = await this.teamModel
      .find({ 'members.userId': userId })
      .sort({ updatedAt: -1 })
      .exec();

    const result: TeamListItem[] = [];

    for (const team of teams) {
      const members = await this.getMembers(team);
      result.push({
        id: team._id,
        name: team.name,
        avatar: team.avatar,
        description: team.description,
        members,
        memberCount: members.length,
        updatedAt: team.updatedAt,
      });
    }

    return result;
  }

  async updateTeam(
    teamId: Types.ObjectId,
    updateData: UpdateTeamDto,
    userId: Types.ObjectId,
  ): Promise<TeamDocument> {
    const team = await this.validateTeamAccess(teamId, userId, Role.ADMIN);

    if (updateData.name) {
      team.name = updateData.name;
    }

    if (updateData.description !== undefined) {
      team.description = updateData.description;
    }

    if (updateData.avatar !== undefined) {
      team.avatar = updateData.avatar;
    }

    if (updateData.settings) {
      team.settings = {
        ...team.settings,
        ...updateData.settings,
      };
    }

    return await this.saveTeam(team);
  }

  async inviteMember(
    teamId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    role: Role,
    requestingUserId: Types.ObjectId,
    expiresAt?: Date,
  ): Promise<void> {
    const team = await this.validateTeamAccess(
      teamId,
      requestingUserId,
      Role.ADMIN,
    );
    await this.validateUser(targetUserId);

    const memberExists = team.members.some((member) =>
      member.userId.equals(targetUserId),
    );

    if (memberExists) {
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.CONFLICT,
      );
    }

    await this.notificationService.createTeamInvite(
      targetUserId,
      teamId,
      requestingUserId,
      role,
      expiresAt,
    );
  }

  async addMember(
    teamId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    role: Role,
    requestingUserId: Types.ObjectId,
  ): Promise<void> {
    const team = await this.validateTeamAccess(
      teamId,
      requestingUserId,
      Role.ADMIN,
    );
    await this.validateUser(targetUserId);

    const memberExists = team.members.some((member) =>
      member.userId.equals(targetUserId),
    );

    if (memberExists) {
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.CONFLICT,
      );
    }

    team.members.push({
      userId: targetUserId,
      role,
      joinedAt: new Date(),
    });

    await this.saveTeam(team);
  }

  async removeMember(
    teamId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    requestingUserId: Types.ObjectId,
  ): Promise<void> {
    const targetUserIdObj = new Types.ObjectId(targetUserId);
    const requestingUserIdObj = new Types.ObjectId(requestingUserId);

    const isSelfRemove = requestingUserIdObj.equals(targetUserIdObj);
    const requiredRole = isSelfRemove ? undefined : Role.ADMIN;

    const team = await this.validateTeamAccess(
      teamId,
      requestingUserIdObj,
      requiredRole,
    );
    await this.validateUser(targetUserIdObj);

    const targetMember = team.members.find((member) =>
      member.userId.equals(targetUserIdObj),
    );
    if (!targetMember) {
      throw new CustomException(
        getErrorMessages({ project: 'userNotFound' }),
        HttpStatus.NOT_FOUND,
      );
    }

    const isOwner = targetMember.role === Role.OWNER;
    if (isOwner && isSelfRemove) {
      const adminMembers = team.members.filter(
        (member) =>
          member.role === Role.ADMIN && !member.userId.equals(targetUserIdObj),
      );
      if (adminMembers.length === 0) {
        throw new CustomException(
          getErrorMessages({ project: 'mustSetNewOwner' }),
          HttpStatus.FORBIDDEN,
        );
      }

      adminMembers[0].role = Role.OWNER;
    } else if (isOwner) {
      throw new CustomException(
        getErrorMessages({ project: 'cannotRemoveOwner' }),
        HttpStatus.FORBIDDEN,
      );
    }
    team.members = team.members.filter(
      (member) => !member.userId.equals(targetUserIdObj),
    );

    await this.saveTeam(team);
  }

  async changeMemberRole(
    teamId: Types.ObjectId,
    changeRoleDto: ChangeTeamMemberRoleDto,
    requestingUserId: Types.ObjectId,
  ): Promise<TeamDocument> {
    const team = await this.validateTeamAccess(
      teamId,
      requestingUserId,
      Role.ADMIN,
    );
    await this.validateUser(changeRoleDto.userId);

    const targetMember = team.members.find((member) =>
      member.userId.equals(changeRoleDto.userId),
    );

    if (!targetMember) {
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.NOT_FOUND,
      );
    }

    if (targetMember.role === Role.OWNER) {
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.FORBIDDEN,
      );
    }

    targetMember.role = changeRoleDto.role;
    return await this.saveTeam(team);
  }

  async deleteTeam(
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    await this.validateTeamAccess(teamId, userId, Role.OWNER);
    const result = await this.teamModel.deleteOne({ _id: teamId }).exec();

    if (result.deletedCount === 0) {
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserRoleInTeam(
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Role | null> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) {
      return null;
    }

    const member = team.members.find((m) => m.userId.equals(userId));
    return member ? member.role : null;
  }

  async getTeamMemberIds(teamId: Types.ObjectId): Promise<Types.ObjectId[]> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) {
      return [];
    }
    return team.members.map((member) => member.userId);
  }

  private async validateTeamAccess(
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
    requiredRole?: Role,
  ): Promise<TeamDocument> {
    this.validateObjectId(teamId);

    const team = await this.teamModel
      .findById(teamId)
      .orFail(() => this.notFoundError())
      .exec();

    if (requiredRole) {
      const userRole = await this.getUserRoleInTeam(teamId, userId);
      if (!userRole || RoleLevel[userRole] < RoleLevel[requiredRole]) {
        throw new CustomException(
          getErrorMessages({ general: 'errorNotRecognized' }),
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return team;
  }

  private async validateUser(userId: Types.ObjectId): Promise<void> {
    await this.usersService.findUserById(userId.toString());
  }

  private validateObjectId(id: Types.ObjectId): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private notFoundError(): NativeError {
    throw new CustomException(
      getErrorMessages({ general: 'errorNotRecognized' }),
      HttpStatus.NOT_FOUND,
    );
  }

  private async saveTeam(team: TeamDocument): Promise<TeamDocument> {
    try {
      await team.save();
      return team;
    } catch {
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getMembers(team: TeamDocument): Promise<TeamMemberInfo[]> {
    const populatedTeam = await this.teamModel
      .findById(team._id)
      .populate<{
        'members.userId': {
          _id: Types.ObjectId;
          nickname: string;
          avatar: string;
        };
      }>({
        path: 'members.userId',
        select: 'nickname avatar',
      })
      .exec();

    return populatedTeam.members.map((member) => {
      const userObj = member.userId as any;
      return {
        id: userObj._id,
        nickname: userObj.nickname,
        avatar: userObj.avatar,
        role: member.role,
        joinedAt: member.joinedAt,
      };
    });
  }
}
