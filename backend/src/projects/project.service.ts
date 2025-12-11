import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ChildBoard,
  ChildSection,
  ExtendedProjectListItem,
  MemberInfo,
  Project,
  ProjectDocument,
  ProjectListItem,
} from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UsersService } from '../users/users.service';
import { BoardService } from '../board/board.service';
import { Field, getErrorMessages } from '../errorMessages/errorMessages';
import { CustomException } from '../exceptions/custom-exception';
import { Section, SectionDocument } from './schemas/section.schema';
import { Board, BoardDocument } from '../board/schemas/board.schema';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { ChangeSectionParentDto } from './dto/change-section-parent.dto';
import { ChangeBoardSectionDto } from './dto/change-board-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Role, RoleLevel, ROLES } from '../shared/types/enums';
import { NotificationService } from '../notifications/notifications.service';
import { TeamService } from '../teams/team.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    private readonly boardService: BoardService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => TeamService))
    private readonly teamService: TeamService,
  ) {}

  async createProject(
    createProjectDto: CreateProjectDto,
    userId: Types.ObjectId,
  ): Promise<Types.ObjectId> {
    try {
      await this.validateUser(userId);
      const newProject = new this.projectModel({
        ...createProjectDto,
        accessControlUsers: [
          {
            userId,
            role: Role.OWNER,
          },
        ],
      });
      await this.saveProject(newProject);
      return newProject._id;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        getErrorMessages({ project: 'creationFailed' }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteProject(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    const project = (await this.validateUser(
      userId,
      projectId,
      Role.OWNER,
    )) as ProjectDocument;

    await this.boardService.deleteByProject(projectId);
    await this.sectionModel.deleteMany({
      $or: [{ _id: { $in: project.sections } }, { projectId }],
    });

    if (
      Array.isArray(project.accessControlTeams) &&
      project.accessControlTeams.length > 0
    ) {
      await Promise.all(
        project.accessControlTeams.map((t) =>
          this.safeRemoveProjectFromTeam(t.teamId, projectId),
        ),
      );
    }

    try {
      await this.notificationService.removeProjectNotifications(projectId);
    } catch (err) {
      console.warn(
        `Failed to delete notifications for project ${projectId}: ${(err as Error).message}`,
      );
    }
    const result = await this.projectModel.deleteOne({ _id: projectId }).exec();

    if (result.deletedCount === 0) {
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changeBoardSection(
    projectId: Types.ObjectId,
    boardId: Types.ObjectId,
    changeBoardParentDto: ChangeBoardSectionDto,
    userId: Types.ObjectId,
  ): Promise<void> {
    await this.validateUser(userId, projectId, Role.EDITOR);

    const newSectionId = changeBoardParentDto.newSectionId;
    this.validateObjectId(changeBoardParentDto.newSectionId, 'section');
    await this.boardService.changeBoardSection(boardId, newSectionId);
  }

  async changeSectionParent(
    projectId: Types.ObjectId,
    sectionId: Types.ObjectId,
    changeSectionParentDto: ChangeSectionParentDto,
    userId: Types.ObjectId,
  ): Promise<SectionDocument> {
    const project = (await this.validateUser(
      userId,
      projectId,
      Role.EDITOR,
    )) as ProjectDocument;

    const section = await this.findSection(sectionId);
    const newParentSectionId = changeSectionParentDto.newParent;
    if (section.parent === null && newParentSectionId !== null) {
      project.sections = project.sections.filter((id) => id !== sectionId);
      await this.saveProject(project);
    } else if (section.parent !== null && newParentSectionId === null) {
      project.sections.push(sectionId);
      await this.saveProject(project);
    }
    if (section.parent) {
      await this.sectionModel.updateOne(
        { _id: section.parent },
        { $pull: { items: { type: 'section', itemId: sectionId } } },
      );
    }
    if (newParentSectionId) {
      await this.sectionModel.updateOne(
        { _id: newParentSectionId },
        { $push: { items: { type: 'section', itemId: sectionId } } },
      );
    }
    section.parent = newParentSectionId;
    await section.save();

    return section;
  }

  async removeSection(
    projectId: Types.ObjectId,
    sectionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    await this.validateUser(userId, projectId, Role.EDITOR);
    const targetSection = await this.findSection(sectionId);
    if (targetSection.parent) {
      await this.sectionModel.updateOne(
        { _id: targetSection.parent },
        { $pull: { items: { type: 'section', itemId: sectionId } } },
      );
    } else if (targetSection.parent === null) {
      await this.projectModel.updateOne(
        { _id: projectId },
        { $pull: { sections: sectionId } },
      );
    }

    const sectionsToDelete = await this.sectionModel
      .aggregate([
        {
          $match: { _id: sectionId },
        },
        {
          $graphLookup: {
            from: 'sections',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'parent',
            as: 'descendants',
            depthField: 'depth',
          },
        },
        {
          $project: {
            allSections: {
              $concatArrays: [['$_id'], '$descendants._id'],
            },
          },
        },
        {
          $unwind: '$allSections',
        },
        {
          $group: {
            _id: null,
            sectionIds: { $addToSet: '$allSections' },
          },
        },
      ])
      .exec();
    if (sectionsToDelete.length === 0) {
      this.notFoundError('section');
    }
    const sectionIds = sectionsToDelete[0].sectionIds;

    const boardsInSections = await this.sectionModel
      .aggregate([
        {
          $match: { _id: { $in: sectionIds } },
        },
        {
          $unwind: '$items',
        },
        {
          $match: { 'items.type': 'board' },
        },
        {
          $group: {
            _id: null,
            boardIds: { $addToSet: '$items.itemId' },
          },
        },
      ])
      .exec();

    const boardIds =
      boardsInSections.length > 0 ? boardsInSections[0].boardIds : [];
    await Promise.all(
      boardIds.map((boardId) =>
        this.boardService.deleteById(boardId, { removeFromParent: false }),
      ),
    );

    await Promise.all([
      this.sectionModel.deleteMany({ _id: { $in: sectionIds } }),
      this.sectionModel.updateMany(
        { 'items.itemId': { $in: sectionIds } },
        { $pull: { items: { itemId: { $in: sectionIds } } } },
      ),
      this.projectModel.updateOne(
        { _id: projectId, sections: sectionId },
        { $pull: { sections: sectionId } },
      ),
    ]);
  }

  async updateSection(
    projectId: Types.ObjectId,
    sectionId: Types.ObjectId,
    updateSectionDto: UpdateSectionDto,
    userId: Types.ObjectId,
  ): Promise<void> {
    await this.validateUser(userId, projectId, Role.EDITOR);

    await this.sectionModel
      .findOneAndUpdate(
        { _id: sectionId, projectId },
        { name: updateSectionDto.name },
        { new: true },
      )
      .orFail(() => this.notFoundError('section'))
      .exec();
  }

  public async getSectionPath(
    sectionId: Types.ObjectId,
  ): Promise<Types.ObjectId[]> {
    if (!sectionId) return [];
    if (!(sectionId instanceof Types.ObjectId)) {
      sectionId = new Types.ObjectId(sectionId);
    }
    const result = await this.sectionModel.aggregate([
      { $match: { _id: sectionId } },
      {
        $graphLookup: {
          from: this.sectionModel.collection.name,
          startWith: '$parent',
          connectFromField: 'parent',
          connectToField: '_id',
          as: 'ancestors',
        },
      },
      {
        $project: {
          path: {
            $concatArrays: [
              { $map: { input: '$ancestors', as: 'a', in: '$$a._id' } },
              ['$_id'],
            ],
          },
        },
      },
    ]);
    return result[0]?.path || [sectionId];
  }

  async getAllUserProjects(userId: Types.ObjectId): Promise<ProjectListItem[]> {
    await this.validateUser(userId);

    const projects = await this.projectModel
      .find({ 'accessControlUsers.userId': userId })
      .sort({ updatedAt: -1 })
      .exec();

    const result: ProjectListItem[] = [];

    for (const project of projects) {
      const members = await this.getMembers(project);
      result.push({
        id: project._id,
        name: project.name,
        avatar: project.avatar,
        description: project.description,
        updatedAt: project.updatedAt,
        members,
      });
    }

    return result;
  }

  async getProjectById(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ExtendedProjectListItem> {
    await this.validateUser(userId, projectId, Role.READER);

    const project = await this.projectModel.findById(projectId).exec();
    const members = await this.getMembers(project);

    const rootSections = await this.sectionModel
      .find({ _id: { $in: project.sections }, parent: null })
      .lean()
      .exec();

    const sections: ChildSection[] = await Promise.all(
      rootSections.map(async (section) => {
        const fullSection = await this.getSection(
          projectId,
          section._id,
          userId,
        );
        return {
          ...fullSection,
          children: fullSection.children.map((child) => {
            if ('children' in child) {
              return { ...child, children: [] };
            }
            return child;
          }),
        };
      }),
    );

    return {
      id: project._id,
      name: project.name,
      avatar: project.avatar,
      description: project.description,
      updatedAt: project.updatedAt,
      members,
      settings: project.settings,
      sections,
    };
  }

  async getProjectDetails(
    projectIds: Types.ObjectId[],
  ): Promise<{ _id: Types.ObjectId; name: string; avatar: string }[]> {
    return this.projectModel
      .find({ _id: { $in: projectIds } }, { _id: 1, name: 1, avatar: 1 })
      .lean()
      .exec();
  }

  async manageProjectUser(
    projectId: Types.ObjectId,
    requestingUserId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    role: Role,
    addUser = false,
    expiresAt?: Date,
  ): Promise<void> {
    const project = (await this.validateUser(
      requestingUserId,
      projectId,
      Role.ADMIN,
    )) as ProjectDocument;
    await this.validateUser(targetUserId);
    const userExists = project.accessControlUsers.some((user) =>
      user.userId.equals(targetUserId),
    );
    if (userExists) {
      throw new CustomException(
        getErrorMessages({ project: 'userAlreadyAdded' }),
        HttpStatus.CONFLICT,
      );
    }
    if (!ROLES.includes(role)) {
      throw new CustomException(
        getErrorMessages({ project: 'invalidRole' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!addUser) {
      await this.notificationService.createProjectInvite(
        targetUserId,
        projectId,
        requestingUserId,
        role,
        expiresAt,
      );
      return;
    } else {
      project.accessControlUsers.push({ userId: targetUserId, role });
      await this.saveProject(project);
    }
  }

  async removeUser(
    projectId: Types.ObjectId,
    requestingUserId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    newOwner?: Types.ObjectId,
  ): Promise<void> {
    const isSelfRemove = requestingUserId.equals(targetUserId);
    const requiredRole = isSelfRemove ? undefined : Role.ADMIN;
    const project = (await this.validateUser(
      requestingUserId,
      projectId,
      requiredRole,
    )) as ProjectDocument;
    await this.validateUser(targetUserId);
    const explicitIndex = project.accessControlUsers.findIndex((u) =>
      u.userId.equals(targetUserId),
    );

    if (explicitIndex !== -1) {
      const isOwner = project.accessControlUsers.some(
        (user) => user.userId.equals(targetUserId) && user.role === Role.OWNER,
      );
      if (isOwner && isSelfRemove) {
        if (!newOwner) {
          throw new CustomException(
            getErrorMessages({ project: 'mustSetNewOwner' }),
            HttpStatus.FORBIDDEN,
          );
        }
        await this.validateUser(newOwner);
        project.accessControlUsers = project.accessControlUsers.filter(
          (user) => !user.userId.equals(newOwner),
        );
        const ownerIndex = project.accessControlUsers.findIndex(
          (user) =>
            user.userId.equals(targetUserId) && user.role === Role.OWNER,
        );
        if (ownerIndex !== -1) {
          project.accessControlUsers[ownerIndex].userId = newOwner;
        }
      } else if (isOwner) {
        throw new CustomException(
          getErrorMessages({ project: 'cannotRemoveOwner' }),
          HttpStatus.FORBIDDEN,
        );
      } else {
        project.accessControlUsers = project.accessControlUsers.filter(
          (user) => !user.userId.equals(targetUserId),
        );
      }
      await this.saveProject(project);
      return;
    }

    let teamIndex = -1;
    for (let i = 0; i < project.accessControlTeams.length; i += 1) {
      const t = project.accessControlTeams[i];
      const hasOverride =
        Array.isArray(t.individualOverrides) &&
        t.individualOverrides.some(
          (o) => o.userId && o.userId.equals(targetUserId),
        );
      if (hasOverride) {
        teamIndex = i;
        break;
      }
    }
    if (teamIndex === -1) {
      const teamCheckPromises = project.accessControlTeams.map((team, index) =>
        this.teamService
          .getUserRoleInTeam(team.teamId, targetUserId)
          .then((roleInTeam) => ({ index, roleInTeam })),
      );
      const results = await Promise.all(teamCheckPromises);
      for (const result of results) {
        if (result.roleInTeam) {
          teamIndex = result.index;
          break;
        }
      }
    }

    if (teamIndex === -1) {
      throw new CustomException(
        getErrorMessages({ project: 'userNotFound' }),
        HttpStatus.NOT_FOUND,
      );
    }

    await this.disbandTeamAndPromoteMembers(project, teamIndex, targetUserId);
  }

  async updateUserRole(
    projectId: Types.ObjectId,
    requestingUserId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    newRole: Role,
  ): Promise<ProjectDocument> {
    const project = (await this.validateUser(
      requestingUserId,
      projectId,
      Role.ADMIN,
    )) as ProjectDocument;
    await this.validateUser(targetUserId);

    if (!ROLES.includes(newRole)) {
      throw new CustomException(
        getErrorMessages({ project: 'invalidRole' }),
        HttpStatus.BAD_REQUEST,
      );
    }
    const explicitIndex = project.accessControlUsers.findIndex((user) =>
      user.userId.equals(targetUserId),
    );

    if (explicitIndex !== -1) {
      const isOwner = project.accessControlUsers.some(
        (user) => user.userId.equals(targetUserId) && user.role === Role.OWNER,
      );

      if (isOwner) {
        throw new CustomException(
          getErrorMessages({ project: 'cannotChangeOwnerRole' }),
          HttpStatus.FORBIDDEN,
        );
      }

      project.accessControlUsers[explicitIndex].role = newRole;
      return await this.saveProject(project);
    }

    for (let i = 0; i < project.accessControlTeams.length; i += 1) {
      const teamAccess = project.accessControlTeams[i];

      if (Array.isArray(teamAccess.individualOverrides)) {
        const override = teamAccess.individualOverrides.find((o) =>
          o.userId.equals(targetUserId),
        );
        if (override) {
          override.role = newRole;
          return await this.saveProject(project);
        }
      }
    }

    const teamCheckPromises = project.accessControlTeams.map(
      (teamAccess, index) =>
        this.teamService
          .getUserRoleInTeam(teamAccess.teamId, targetUserId)
          .then((roleInTeam) => ({ index, roleInTeam })),
    );
    const results = await Promise.all(teamCheckPromises);
    for (const result of results) {
      if (result.roleInTeam) {
        const teamAccess = project.accessControlTeams[result.index];
        teamAccess.individualOverrides = teamAccess.individualOverrides || [];
        teamAccess.individualOverrides.push({
          userId: targetUserId,
          role: newRole,
        } as any);
        return await this.saveProject(project);
      }
    }

    throw new CustomException(
      getErrorMessages({ project: 'userNotFound' }),
      HttpStatus.NOT_FOUND,
    );
  }

  async updateProjectInfo(
    projectId: Types.ObjectId,
    updateData: UpdateProjectDto,
    userId: Types.ObjectId,
  ): Promise<void> {
    const project = (await this.validateUser(
      userId,
      projectId,
      Role.ADMIN,
    )) as ProjectDocument;

    if (updateData.name) {
      project.name = updateData.name;
    }

    if (updateData.description) {
      project.description = updateData.description;
    }

    if (updateData.avatar) {
      project.avatar = updateData.avatar;
    }

    if (updateData.settings) {
      project.settings = {
        ...project.settings,
        ...updateData.settings,
      };
    }

    await this.saveProject(project);
  }

  async getSection(
    projectId: Types.ObjectId,
    sectionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ChildSection> {
    await this.validateUser(userId, projectId, Role.READER);

    const section = await this.findSection(sectionId);

    const sectionItems = section.items.filter(
      (item) => item.type === 'section',
    );
    const boardItems = section.items.filter((item) => item.type === 'board');

    const childSections =
      sectionItems.length > 0
        ? await this.sectionModel
            .find({
              _id: { $in: sectionItems.map((item) => item.itemId) },
            })
            .lean()
            .exec()
        : [];

    const boards =
      boardItems.length > 0
        ? await this.boardModel
            .find({
              _id: { $in: boardItems.map((item) => item.itemId) },
            })
            .lean()
            .exec()
        : [];

    const sectionMap = new Map(childSections.map((s) => [s._id.toString(), s]));
    const boardMap = new Map(boards.map((b) => [b._id.toString(), b]));

    const children: Array<ChildSection | ChildBoard> = [];

    for (const item of sectionItems) {
      const childSection = sectionMap.get(item.itemId.toString());
      if (childSection) {
        children.push({
          id: childSection._id,
          parentId: section._id,
          name: childSection.name,
          childrenNumber: childSection.items?.length || 0,
          children: [],
        } as ChildSection);
      }
    }

    for (const item of boardItems) {
      const board = boardMap.get(item.itemId.toString());
      if (board) {
        children.push({
          id: board._id,
          sectionId: board.sectionId,
          name: board.name,
          type: board.type,
          updatedAt: board.updatedAt,
        } as ChildBoard);
      }
    }

    return {
      id: section._id,
      parentId: section.parent,
      name: section.name,
      childrenNumber: section.items.length,
      children,
    };
  }

  public async addBoardToSection(
    sectionId: Types.ObjectId,
    boardId: Types.ObjectId,
  ): Promise<void> {
    const section = await this.findSection(sectionId);
    section.items.push({ type: 'board', itemId: boardId });
    await section.save();
  }

  public async removeBoardFromSection(
    sectionId: Types.ObjectId,
    boardId: Types.ObjectId,
  ): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(sectionId)) {
        console.warn(
          `Skipping section cleanup - invalid sectionId for board ${boardId}`,
        );
        return;
      }
      const result = await this.sectionModel
        .updateOne(
          { _id: sectionId },
          { $pull: { items: { type: 'board', itemId: boardId } } },
        )
        .exec();

      if (result.modifiedCount === 0) {
        console.warn(`Board ${boardId} not found in section ${sectionId}`);
      }
    } catch {
      throw new CustomException(
        getErrorMessages({ section: 'failedRemoveBoard' }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async addSection(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
    createSectionDto: CreateSectionDto,
  ): Promise<Types.ObjectId> {
    const project = (await this.validateUser(
      userId,
      projectId,
      Role.EDITOR,
    )) as ProjectDocument;

    const { parentSectionId, name } = createSectionDto;
    if (parentSectionId) {
      return this.addSectionToSection(projectId, parentSectionId, name);
    } else {
      return this.addSectionToProject(project, name);
    }
  }

  public async addTeamToProject(
    projectId: Types.ObjectId,
    teamId: Types.ObjectId,
    role: Role,
    userId: Types.ObjectId,
    sendInvite = true,
    expiresAt?: Date,
  ): Promise<void> {
    if (!ROLES.includes(role)) {
      throw new CustomException(
        getErrorMessages({ project: 'invalidRole' }),
        HttpStatus.BAD_REQUEST,
      );
    }
    if (sendInvite) {
      await this.validateUser(userId, projectId, Role.ADMIN);
    } else {
      await this.findProjectById(projectId);
    }

    await this.teamService.findTeamById(teamId);
    const project = await this.findProjectById(projectId);
    const exists = project.accessControlTeams.some((t) =>
      t.teamId.equals(teamId),
    );
    if (exists) {
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.CONFLICT,
      );
    }

    if (sendInvite) {
      await this.notificationService.createProjectTeamInvite(
        projectId,
        teamId,
        userId,
        role,
        expiresAt,
      );
      return;
    }

    project.accessControlTeams.push({
      teamId,
      role,
      addedAt: new Date(),
      individualOverrides: [],
    } as any);
    await this.saveProject(project);
    await this.safeAddProjectToTeam(teamId, projectId);
  }

  async removeTeamFromProject(
    projectId: Types.ObjectId,
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    const project = (await this.validateUser(
      userId,
      projectId,
      Role.ADMIN,
    )) as ProjectDocument;
    await this.removeTeamInternal(projectId, teamId, project);
  }

  public async removeTeamFromProjectByTeam(
    projectId: Types.ObjectId,
    teamId: Types.ObjectId,
  ): Promise<void> {
    const project = await this.findProjectById(projectId);
    await this.removeTeamInternal(projectId, teamId, project);
  }

  async updateTeamRoleInProject(
    projectId: Types.ObjectId,
    teamId: Types.ObjectId,
    newRole: Role,
    userId: Types.ObjectId,
  ): Promise<ProjectDocument> {
    const project = (await this.validateUser(
      userId,
      projectId,
      Role.ADMIN,
    )) as ProjectDocument;

    if (!ROLES.includes(newRole)) {
      throw new CustomException(
        getErrorMessages({ project: 'invalidRole' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    const teamIndex = project.accessControlTeams.findIndex((t) =>
      t.teamId.equals(teamId),
    );

    if (teamIndex === -1) {
      throw new CustomException(
        getErrorMessages({ project: 'notFound' }),
        HttpStatus.NOT_FOUND,
      );
    }

    project.accessControlTeams[teamIndex].role = newRole;
    return await this.saveProject(project);
  }

  async getProjectMemberIds(
    projectId: Types.ObjectId,
  ): Promise<Types.ObjectId[]> {
    const members = await this.getMembers(
      await this.findProjectById(projectId),
    );
    return members.map((m) => m.id);
  }

  async getProjectAdminIds(
    projectId: Types.ObjectId,
  ): Promise<Types.ObjectId[]> {
    const members = await this.getMembers(
      await this.findProjectById(projectId),
    );
    return members
      .filter((m) => m.role === Role.ADMIN || m.role === Role.OWNER)
      .map((m) => m.id);
  }

  async findProjectById(projectId: Types.ObjectId): Promise<ProjectDocument> {
    this.validateObjectId(projectId, 'project');

    return await this.projectModel
      .findById(projectId)
      .orFail(() => this.notFoundError('project'))
      .exec();
  }

  async validateUser(
    userId: Types.ObjectId,
    projectId?: Types.ObjectId,
    requiredRole?: Role,
  ): Promise<ProjectDocument | void> {
    await this.usersService.findUserById(userId.toString());
    if (projectId) {
      const project = await this.findProjectById(projectId);

      if (requiredRole) {
        const userRole = await this.getUserRole(projectId, userId);
        if (!userRole || RoleLevel[userRole] < RoleLevel[requiredRole]) {
          throw new CustomException(
            getErrorMessages({ project: 'noPermission' }),
            HttpStatus.FORBIDDEN,
          );
        }
      }

      return project;
    }
    return;
  }

  async getProjectBriefInfo(
    projectId: Types.ObjectId,
    userId?: Types.ObjectId,
  ): Promise<any> {
    this.validateObjectId(projectId, 'project');

    const project = await this.projectModel
      .findById(projectId)
      .orFail(() => this.notFoundError('project'))
      .exec();

    if (!project.settings.isPublic) {
      throw new CustomException(
        getErrorMessages({ project: 'noPermission' }),
        HttpStatus.FORBIDDEN,
      );
    }

    if (userId) {
      const userRole = await this.getUserRole(projectId, userId);
      if (userRole) {
        throw new CustomException(
          { message: 'User already a member of this project' },
          HttpStatus.CONFLICT,
        );
      }
    }

    let members: MemberInfo[] = [];
    if (project.settings.memberListIsPublic) {
      members = await this.getMembers(project);
    }

    return {
      id: project._id,
      name: project.name,
      avatar: project.avatar,
      description: project.description,
      members: project.settings.memberListIsPublic ? members : [],
      updatedAt: project.updatedAt,
      settings: {
        allowRequests: project.settings.allowRequests,
        memberListIsPublic: project.settings.memberListIsPublic,
      },
    };
  }

  private async removeTeamInternal(
    projectId: Types.ObjectId,
    teamId: Types.ObjectId,
    project: ProjectDocument,
  ): Promise<void> {
    const teamIndex = project.accessControlTeams.findIndex((t) =>
      t.teamId.equals(teamId),
    );
    if (teamIndex === -1) {
      throw new CustomException(
        getErrorMessages({ project: 'notFound' }),
        HttpStatus.NOT_FOUND,
      );
    }
    project.accessControlTeams.splice(teamIndex, 1);
    await this.saveProject(project);
    await this.safeRemoveProjectFromTeam(teamId, projectId);
  }

  private async disbandTeamAndPromoteMembers(
    project: ProjectDocument,
    teamIndex: number,
    removedUserId: Types.ObjectId,
  ): Promise<void> {
    const teamAccess = project.accessControlTeams[teamIndex];
    const teamId = teamAccess.teamId;
    const teamMemberIds = await this.teamService.getTeamMemberIds(teamId);
    const explicitUserIdSet = new Set(
      project.accessControlUsers.map((u) => u.userId.toString()),
    );

    const earlierTeams = project.accessControlTeams
      .slice(0, teamIndex)
      .map((t) => t.teamId.toString());

    for (const memberId of teamMemberIds) {
      if (memberId.equals(removedUserId)) continue;

      if (explicitUserIdSet.has(memberId.toString())) continue;

      let isInHigherPriorityTeam = false;
      for (const earlierTeamIdStr of earlierTeams) {
        const roleInEarlierTeam = await this.teamService.getUserRoleInTeam(
          new Types.ObjectId(earlierTeamIdStr),
          memberId,
        );
        if (roleInEarlierTeam) {
          isInHigherPriorityTeam = true;
          break;
        }
      }
      if (isInHigherPriorityTeam) continue;

      let effectiveRole: Role | null = null;
      if (Array.isArray(teamAccess.individualOverrides)) {
        const override = teamAccess.individualOverrides.find((o) =>
          o.userId.equals(memberId),
        );
        if (override) {
          effectiveRole = override.role;
        }
      }
      if (!effectiveRole) {
        const roleInTeam = await this.teamService.getUserRoleInTeam(
          teamId,
          memberId,
        );
        if (!roleInTeam) {
          continue;
        }
        effectiveRole = roleInTeam;
        if (
          RoleLevel[effectiveRole] > RoleLevel[teamAccess.role] &&
          RoleLevel[teamAccess.role] !== undefined
        ) {
          effectiveRole = teamAccess.role;
        }
      }
      project.accessControlUsers.push({
        userId: memberId,
        role: effectiveRole,
      } as any);
      explicitUserIdSet.add(memberId.toString());
    }
    project.accessControlTeams.splice(teamIndex, 1);
    await this.saveProject(project);
    await this.safeRemoveProjectFromTeam(teamId, project._id);
  }

  private validateObjectId(id: Types.ObjectId, errorKey: Field): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new CustomException(
        getErrorMessages({ [errorKey]: 'invalidType' }),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private notFoundError(errorKey: Field): NativeError {
    throw new CustomException(
      getErrorMessages({ [errorKey]: 'notFound' }),
      HttpStatus.NOT_FOUND,
    );
  }

  private async findSection(
    sectionId: Types.ObjectId,
  ): Promise<SectionDocument> {
    return await this.sectionModel
      .findById(sectionId)
      .orFail(() => this.notFoundError('section'))
      .exec();
  }

  private async saveProject(
    project: ProjectDocument,
  ): Promise<ProjectDocument> {
    try {
      await project.save();
      return project;
    } catch {
      throw new CustomException(
        getErrorMessages({ project: 'updateFailed' }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getMembers(project: ProjectDocument): Promise<MemberInfo[]> {
    const populatedProject = await this.projectModel
      .findById(project._id)
      .populate<{
        'accessControlUsers.userId': {
          _id: Types.ObjectId;
          nickname: string;
          avatar: string;
        };
      }>({
        path: 'accessControlUsers.userId',
        select: 'nickname avatar',
      })
      .exec();

    const membersMap = new Map<string, MemberInfo>();

    populatedProject.accessControlUsers.forEach((user) => {
      const userObj = user.userId as any;
      membersMap.set(userObj._id.toString(), {
        id: userObj._id,
        nickname: userObj.nickname,
        avatar: userObj.avatar,
        role: user.role,
        team: undefined,
        teamId: undefined,
      });
    });

    for (const teamAccess of project.accessControlTeams) {
      const overrideMap = new Map<string, Role>();
      if (Array.isArray(teamAccess.individualOverrides)) {
        for (const o of teamAccess.individualOverrides) {
          if (o && o.userId) {
            overrideMap.set(o.userId.toString(), o.role);
          }
        }
      }

      const teamMembers = await this.teamService.getMembersInfo(
        teamAccess.teamId,
      );
      const teamName =
        teamMembers.length > 0 && (teamMembers[0] as any).teamName
          ? (teamMembers[0] as any).teamName
          : undefined;

      for (const tm of teamMembers) {
        const idStr = tm.id.toString();
        if (membersMap.has(idStr)) continue;

        let effectiveRole: Role = overrideMap.get(idStr) ?? tm.role;

        if (
          overrideMap.get(idStr) === undefined &&
          RoleLevel[effectiveRole] > RoleLevel[teamAccess.role] &&
          RoleLevel[teamAccess.role] !== undefined
        ) {
          effectiveRole = teamAccess.role;
        }

        membersMap.set(idStr, {
          id: tm.id,
          nickname: tm.nickname,
          avatar: tm.avatar,
          role: effectiveRole,
          team: teamName,
          teamId: teamAccess.teamId,
        });
      }
    }

    return Array.from(membersMap.values());
  }

  private async getUserRole(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Role | null> {
    const project = await this.findProjectById(projectId);
    const userAccess = project.accessControlUsers.find((user) =>
      user.userId.equals(userId),
    );

    if (userAccess) {
      return userAccess.role;
    }

    for (const teamAccess of project.accessControlTeams) {
      const individualOverride = (teamAccess.individualOverrides || []).find(
        (override) => override.userId && override.userId.equals(userId),
      );

      if (individualOverride) {
        return individualOverride.role;
      }

      const userRoleInTeam = await this.teamService.getUserRoleInTeam(
        teamAccess.teamId,
        userId,
      );

      if (userRoleInTeam) {
        if (RoleLevel[userRoleInTeam] > RoleLevel[teamAccess.role]) {
          return teamAccess.role;
        }
        return userRoleInTeam;
      }
    }

    return null;
  }

  private async addSectionToProject(
    project: ProjectDocument,
    name: string,
  ): Promise<Types.ObjectId> {
    const newSection = new this.sectionModel({ projectId: project._id, name });
    await newSection.save();

    project.sections.push(newSection._id);
    await this.saveProject(project);

    return newSection._id;
  }

  private async addSectionToSection(
    projectId: Types.ObjectId,
    parentSectionId: Types.ObjectId,
    name: string,
  ): Promise<Types.ObjectId> {
    const parentSection = await this.findSection(parentSectionId);
    const newSection = new this.sectionModel({
      projectId,
      name,
      parent: parentSectionId,
    });
    await newSection.save();

    parentSection.items.push({ type: 'section', itemId: newSection._id });
    await parentSection.save();

    return newSection._id;
  }

  private async isUserInTeam(
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<boolean> {
    const memberIds = await this.teamService.getTeamMemberIds(teamId);
    return memberIds.some((id) => id.equals(userId));
  }

  private async safeAddProjectToTeam(
    teamId: Types.ObjectId,
    projectId: Types.ObjectId,
  ): Promise<void> {
    try {
      await this.teamService.addProjectToTeam(teamId, projectId);
    } catch (err) {
      console.warn(
        `Failed to add project ${projectId} to team ${teamId}: ${(err as Error).message}`,
      );
    }
  }

  private async safeRemoveProjectFromTeam(
    teamId: Types.ObjectId,
    projectId: Types.ObjectId,
  ): Promise<void> {
    try {
      await this.teamService.removeProjectFromTeam(teamId, projectId);
    } catch (err) {
      console.warn(
        `Failed to remove project ${projectId} from team ${teamId}: ${(err as Error).message}`,
      );
    }
  }
}
