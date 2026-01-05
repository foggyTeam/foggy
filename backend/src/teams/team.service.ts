import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';
import {
  Team,
  type TeamDocument,
  type TeamListItem,
  type TeamMemberInfo,
} from './schemas/team.schema';
import type { CreateTeamDto } from './dto/create-team.dto';
import type { UpdateTeamDto } from './dto/update-team.dto';
import type { ChangeTeamMemberRoleDto } from './dto/change-team-member-role.dto';
import { UsersService } from '../users/users.service';
import { CustomException } from '../exceptions/custom-exception';
import { getErrorMessages } from '../errorMessages/errorMessages';
import { Role, RoleLevel } from '../shared/types/enums';
import { NotificationService } from '../notifications/notifications.service';
import { ProjectListItem } from '../projects/schemas/project.schema';
import { ProjectService } from '../projects/project.service';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
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
  ): Promise<any> {
    await this.validateUser(userId);
    await this.validateTeamAccess(teamId, userId, Role.READER);

    const team = await this.teamModel
      .findById(teamId)
      .orFail(() => this.notFoundError())
      .lean()
      .exec();

    const members = await this.getMembers(team as TeamDocument);
    const projects = await this.getTeamProjects(teamId, userId);

    return {
      id: team._id,
      name: team.name,
      avatar: team.avatar,
      settings: team.settings,
      members,
      projects,
    };
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
      result.push(<TeamListItem>{
        id: team._id,
        name: team.name,
        avatar: team.avatar,
        members,
        memberCount: members.length,
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
    newOwner?: Types.ObjectId,
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
      if (!newOwner) {
        throw new CustomException(
          getErrorMessages({ project: 'mustSetNewOwner' }),
          HttpStatus.FORBIDDEN,
        );
      }
      if (newOwner.equals(targetUserIdObj)) {
        throw new CustomException(
          getErrorMessages({ project: 'mustSetNewOwner' }),
          HttpStatus.FORBIDDEN,
        );
      }
      await this.validateUser(newOwner);
      const newOwnerMember = team.members.find((m) =>
        m.userId.equals(newOwner),
      );
      if (!newOwnerMember) {
        throw new CustomException(
          getErrorMessages({ project: 'userNotFound' }),
          HttpStatus.NOT_FOUND,
        );
      }
      newOwnerMember.role = Role.OWNER;
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
    newOwner?: Types.ObjectId,
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
        getErrorMessages({ project: 'userNotFound' }),
        HttpStatus.NOT_FOUND,
      );
    }

    const isOwner = targetMember.role === Role.OWNER;

    if (isOwner) {
      const isSelfChange = new Types.ObjectId(requestingUserId).equals(
        changeRoleDto.userId,
      );

      if (!isSelfChange) {
        throw new CustomException(
          getErrorMessages({ project: 'cannotChangeOwnerRole' }),
          HttpStatus.FORBIDDEN,
        );
      }

      if (!newOwner) {
        throw new CustomException(
          getErrorMessages({ project: 'mustSetNewOwner' }),
          HttpStatus.FORBIDDEN,
        );
      }

      if (newOwner.equals(changeRoleDto.userId)) {
        throw new CustomException(
          getErrorMessages({ project: 'mustSetNewOwner' }),
          HttpStatus.FORBIDDEN,
        );
      }

      await this.validateUser(newOwner);
      const newOwnerMember = team.members.find((m) =>
        m.userId.equals(newOwner),
      );
      if (!newOwnerMember) {
        throw new CustomException(
          getErrorMessages({ project: 'userNotFound' }),
          HttpStatus.NOT_FOUND,
        );
      }

      newOwnerMember.role = Role.OWNER;
      targetMember.role = changeRoleDto.role;

      return await this.saveTeam(team);
    }

    targetMember.role = changeRoleDto.role;
    return await this.saveTeam(team);
  }

  async deleteTeam(
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    await this.validateTeamAccess(teamId, userId, Role.OWNER);
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) {
      throw this.notFoundError();
    }

    if (team.projects && team.projects.length > 0) {
      for (const projectId of team.projects) {
        try {
          await this.projectService.removeTeamFromProjectByTeam(
            projectId,
            teamId,
          );
        } catch (err) {
          console.warn(
            `Failed to remove team ${teamId} from project ${projectId}: ${err.message}`,
          );
        }
      }
    }

    try {
      await this.notificationService.removeTeamNotifications(teamId);
    } catch (err) {
      console.warn(
        `Failed to delete notifications for team ${teamId}: ${err.message}`,
      );
    }
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

  public async getMembersInfo(
    teamId: Types.ObjectId,
  ): Promise<TeamMemberInfo[]> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) return [];

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

    const teamName = populatedTeam.name;

    return populatedTeam.members.map((member) => {
      const userObj = member.userId as any;
      return {
        id: userObj._id,
        nickname: userObj.nickname,
        avatar: userObj.avatar,
        role: member.role,
        teamName,
      };
    });
  }

  async getTeamBriefInfo(
    teamId: Types.ObjectId,
    userId?: Types.ObjectId,
  ): Promise<any> {
    this.validateObjectId(teamId);

    const team = await this.teamModel
      .findById(teamId)
      .orFail(() => this.notFoundError())
      .exec();

    if (userId) {
      const userRole = await this.getUserRoleInTeam(teamId, userId);
      if (userRole) {
        throw new CustomException(
          { message: 'User already a member of this team' },
          HttpStatus.CONFLICT,
        );
      }
    }

    let members: TeamMemberInfo[] = [];
    if (team.settings.memberListIsPublic) {
      members = await this.getMembers(team);
    }

    let projects: any[] = [];
    if (
      team.settings.projectListIsPublic &&
      team.projects &&
      team.projects.length > 0
    ) {
      for (const projectId of team.projects) {
        try {
          projects.push(
            await this.projectService.getProjectBriefInfo(projectId),
          );
        } catch (err) {
          console.warn(
            `Skipping project ${projectId} in team brief info ${teamId}: ${(err as Error).message}`,
          );
        }
      }
    }

    return {
      id: team._id,
      name: team.name,
      avatar: team.avatar,
      memberCount: team.members.length,
      members: team.settings.memberListIsPublic ? members : [],
      settings: team.settings,
      projects: team.settings.projectListIsPublic ? projects : [],
    };
  }

  public async getTeamAdminIds(
    teamId: Types.ObjectId,
  ): Promise<Types.ObjectId[]> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) return [];
    return team.members
      .filter((m) => m.role === Role.ADMIN || m.role === Role.OWNER)
      .map((m) => m.userId);
  }

  public async getTeamOwnerId(teamId: Types.ObjectId): Promise<Types.ObjectId> {
    const team = await this.findTeamById(teamId);
    const owner = team.members.find((m) => m.role === Role.OWNER);
    if (!owner) {
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return owner.userId;
  }

  public async findTeamById(teamId: Types.ObjectId): Promise<TeamDocument> {
    if (!Types.ObjectId.isValid(teamId)) {
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.teamModel
      .findById(teamId)
      .orFail(() => this.notFoundError())
      .exec();
  }

  public async addProjectToTeam(
    teamId: Types.ObjectId,
    projectId: Types.ObjectId,
  ): Promise<void> {
    const team = await this.findTeamById(teamId);
    const exists = team.projects.some((p) => p.equals(projectId));
    if (exists) return;
    team.projects.push(projectId);
    await this.saveTeam(team);
  }

  public async removeProjectFromTeam(
    teamId: Types.ObjectId,
    projectId: Types.ObjectId,
  ): Promise<void> {
    const team = await this.findTeamById(teamId);
    const had = team.projects.some((p) => p.equals(projectId));
    if (!had) return;
    team.projects = team.projects.filter((p) => !p.equals(projectId));
    await this.saveTeam(team);
  }

  public async getTeamProjects(
    teamId: Types.ObjectId,
    requestingUserId: Types.ObjectId,
  ): Promise<ProjectListItem[]> {
    await this.validateTeamAccess(teamId, requestingUserId, Role.READER);
    const team = await this.findTeamById(teamId);

    if (!team.projects || team.projects.length === 0) return [];

    const result: ProjectListItem[] = [];

    for (const projectId of team.projects) {
      try {
        const projectView = await this.projectService.getProjectById(
          projectId,
          requestingUserId,
        );
        result.push({
          id: projectView.id,
          name: projectView.name,
          avatar: projectView.avatar,
          description: projectView.description,
          updatedAt: projectView.updatedAt,
          members: projectView.members,
        });
      } catch (err) {
        console.warn(
          `Skipping project ${projectId} for team ${teamId}: ${(err as Error).message}`,
        );
      }
    }

    return result;
  }

  public async leaveProject(
    teamId: Types.ObjectId,
    projectId: Types.ObjectId,
    requestingUserId: Types.ObjectId,
  ): Promise<void> {
    await this.validateTeamAccess(teamId, requestingUserId, Role.ADMIN);
    await this.projectService.removeTeamFromProjectByTeam(projectId, teamId);
  }

  async searchTeams(query: string, limit = 20, cursor?: string) {
    const validatedLimit = Math.min(Math.max(limit, 1), 100);

    const filter: any = {};
    if (query) {
      filter.name = { $regex: query, $options: 'i' };
    }
    if (cursor) {
      filter._id = { $gt: new Types.ObjectId(cursor) };
    }

    const teams = await this.teamModel
      .find(filter)
      .sort({ _id: 1 })
      .limit(validatedLimit)
      .select('name avatar _id')
      .exec();

    const nextCursor =
      teams.length === validatedLimit ? teams[teams.length - 1]._id : null;

    return {
      teams: teams.map((team) => ({
        id: team._id,
        name: team.name,
        avatar: team.avatar,
      })),
      nextCursor,
      hasNextPage: Boolean(nextCursor),
    };
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
          id: Types.ObjectId;
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
      };
    });
  }
}
