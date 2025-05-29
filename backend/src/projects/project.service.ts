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
  Role,
} from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UsersService } from '../users/users.service';
import { BoardService } from '../board/board.service';
import { getErrorMessages } from '../errorMessages/errorMessages';
import { CustomException } from '../exceptions/custom-exception';
import { Section, SectionDocument } from './schemas/section.schema';
import { Board, BoardDocument } from '../board/schemas/board.schema';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { ChangeSectionParentDto } from './dto/change-section-parent.dto';
import { ChangeBoardSectionDto } from './dto/change-board-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

enum RoleLevel {
  reader = 0,
  editor = 1,
  admin = 2,
  owner = 3,
}

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    private readonly boardService: BoardService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
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
            role: 'owner',
          },
        ],
      });
      await newProject.save();
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
      'owner',
    )) as ProjectDocument;

    await this.boardService.deleteByProject(projectId);
    await this.sectionModel.deleteMany({
      $or: [{ _id: { $in: project.sections } }, { projectId }],
    });
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
    await this.validateUser(userId, projectId, 'editor');

    const newSectionId = changeBoardParentDto.newSectionId;
    if (!Types.ObjectId.isValid(newSectionId)) {
      throw new CustomException(
        getErrorMessages({ section: 'invalidType' }),
        HttpStatus.BAD_REQUEST,
      );
    }
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
      'editor',
    )) as ProjectDocument;

    const section = await this.sectionModel
      .findById(sectionId)
      .orFail(
        () =>
          new CustomException(
            getErrorMessages({ section: 'notFound' }),
            HttpStatus.NOT_FOUND,
          ),
      )
      .exec();
    const newParentSectionId = changeSectionParentDto.newParent;
    if (section.parent === null && newParentSectionId !== null) {
      project.sections = project.sections.filter((id) => id !== sectionId);
      await project.save();
    } else if (section.parent !== null && newParentSectionId === null) {
      project.sections.push(sectionId);
      await project.save();
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
    await this.validateUser(userId, projectId, 'editor');
    const targetSection = await this.sectionModel.findById(sectionId).exec();
    if (!targetSection) {
      throw new CustomException(
        getErrorMessages({ section: 'notFound' }),
        HttpStatus.NOT_FOUND,
      );
    }
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
    console.log('2', sectionsToDelete);
    if (sectionsToDelete.length === 0) {
      throw new CustomException(
        getErrorMessages({ section: 'notFound' }),
        HttpStatus.NOT_FOUND,
      );
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
    await this.validateUser(userId, projectId, 'editor');

    await this.sectionModel
      .findOneAndUpdate(
        { _id: sectionId, projectId },
        { name: updateSectionDto.name },
        { new: true },
      )
      .orFail(
        () =>
          new CustomException(
            getErrorMessages({ section: 'notFound' }),
            HttpStatus.NOT_FOUND,
          ),
      )
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
    await this.validateUser(userId, projectId, 'reader');

    const project = await this.projectModel.findById(projectId).exec();

    const members = await this.getMembers(project);

    const rootSections = await this.sectionModel
      .find({ _id: { $in: project.sections }, parent: null })
      .lean()
      .exec();

    const rootSectionIds = rootSections.map((s) => s._id);
    const childSections = await this.sectionModel
      .find({ parent: { $in: rootSectionIds } })
      .lean()
      .exec();

    const allBoardIds: Types.ObjectId[] = [];
    rootSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.type === 'board') {
          allBoardIds.push(item.itemId);
        }
      });
    });
    childSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.type === 'board') {
          allBoardIds.push(item.itemId);
        }
      });
    });

    const boards = allBoardIds.length
      ? await this.boardModel
          .find({ _id: { $in: allBoardIds } })
          .lean()
          .exec()
      : [];

    const boardMap = new Map(boards.map((b) => [b._id.toString(), b]));
    const childSectionMap = new Map(
      childSections.map((s) => [s._id.toString(), s]),
    );

    function buildSectionChildren(section): Array<ChildSection | ChildBoard> {
      return section.items
        .map((item) => {
          if (item.type === 'section') {
            const child = childSectionMap.get(item.itemId.toString());
            if (!child) return null;
            return {
              id: child._id,
              parentId: child.parent,
              name: child.name,
              childrenNumber: child.items.length,
              // Дальше детей НЕ включаем (children: [])
              children: [],
            } as ChildSection;
          } else if (item.type === 'board') {
            const board = boardMap.get(item.itemId.toString());
            if (!board) return null;
            return {
              id: board._id,
              sectionId: board.sectionId,
              name: board.name,
              type: board.type,
              updatedAt: board.updatedAt,
            } as ChildBoard;
          }
          return null;
        })
        .filter(Boolean);
    }

    const sections: ChildSection[] = rootSections.map((section) => ({
      id: section._id,
      parentId: section.parent,
      name: section.name,
      childrenNumber: section.items.length,
      children: buildSectionChildren(section),
    }));

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

  async addUser(
    projectId: Types.ObjectId,
    requestingUserId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    role: Role,
  ): Promise<ProjectDocument> {
    const project = (await this.validateUser(
      requestingUserId,
      projectId,
      'admin',
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
    if (!['admin', 'editor', 'reader'].includes(role)) {
      throw new CustomException(
        getErrorMessages({ project: 'invalidRole' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    project.accessControlUsers.push({ userId: targetUserId, role });

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

  async removeUser(
    projectId: Types.ObjectId,
    requestingUserId: Types.ObjectId,
    targetUserId: Types.ObjectId,
  ): Promise<ProjectDocument> {
    const project = (await this.validateUser(
      requestingUserId,
      projectId,
      'admin',
    )) as ProjectDocument;
    await this.validateUser(targetUserId);
    const isOwner = project.accessControlUsers.some(
      (user) => user.userId.equals(targetUserId) && user.role === 'owner',
    );

    if (isOwner) {
      throw new CustomException(
        getErrorMessages({ project: 'cannotRemoveOwner' }),
        HttpStatus.FORBIDDEN,
      );
    }

    project.accessControlUsers = project.accessControlUsers.filter(
      (user) => !user.userId.equals(targetUserId),
    );

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

  async updateUserRole(
    projectId: Types.ObjectId,
    requestingUserId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    newRole: Role,
  ): Promise<ProjectDocument> {
    const project = (await this.validateUser(
      requestingUserId,
      projectId,
      'admin',
    )) as ProjectDocument;
    await this.validateUser(targetUserId);
    const isOwner = project.accessControlUsers.some(
      (user) => user.userId.equals(targetUserId) && user.role === 'owner',
    );

    if (isOwner) {
      throw new CustomException(
        getErrorMessages({ project: 'cannotChangeOwnerRole' }),
        HttpStatus.FORBIDDEN,
      );
    }

    const userIndex = project.accessControlUsers.findIndex((user) =>
      user.userId.equals(targetUserId),
    );

    if (userIndex === -1) {
      throw new CustomException(
        getErrorMessages({ project: 'userNotFound' }),
        HttpStatus.NOT_FOUND,
      );
    }

    project.accessControlUsers[userIndex].role = newRole;

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

  async updateProjectInfo(
    projectId: Types.ObjectId,
    updateData: UpdateProjectDto,
    userId: Types.ObjectId,
  ): Promise<void> {
    const project = (await this.validateUser(
      userId,
      projectId,
      'admin',
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

    try {
      await project.save();
    } catch {
      throw new CustomException(
        getErrorMessages({ project: 'updateFailed' }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSection(
    projectId: Types.ObjectId,
    sectionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ChildSection> {
    await this.validateUser(userId, projectId, 'reader');

    const section = await this.sectionModel
      .findById(sectionId)
      .orFail(
        () =>
          new CustomException(
            getErrorMessages({ section: 'notFound' }),
            HttpStatus.NOT_FOUND,
          ),
      )
      .lean()
      .exec();

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
    const section = await this.sectionModel.findById(sectionId).exec();
    if (!section) {
      throw new CustomException(
        getErrorMessages({ section: 'notFound' }),
        HttpStatus.FORBIDDEN,
      );
    }
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
      'editor',
    )) as ProjectDocument;

    const { parentSectionId, name } = createSectionDto;
    if (parentSectionId) {
      return this.addSectionToSection(projectId, parentSectionId, name);
    } else {
      return this.addSectionToProject(project, name);
    }
  }

  async addTeamToProject(
    projectId: Types.ObjectId,
    teamId: Types.ObjectId,
    role: Role,
    userId: Types.ObjectId,
  ): Promise<void> {
    await this.validateUser(userId, projectId, 'admin');
    throw new CustomException(
      getErrorMessages({ feature: 'notImplemented' }),
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  async removeTeamFromProject(
    projectId: Types.ObjectId,
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    await this.validateUser(userId, projectId, 'admin');
    throw new CustomException(
      getErrorMessages({ feature: 'notImplemented' }),
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  async updateTeamRoleInProject(
    projectId: Types.ObjectId,
    teamId: Types.ObjectId,
    newRole: Role,
    userId: Types.ObjectId,
  ): Promise<void> {
    await this.validateUser(userId, projectId, 'admin');
    throw new CustomException(
      getErrorMessages({ feature: 'notImplemented' }),
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  async getProjectMemberIds(
    projectId: Types.ObjectId,
  ): Promise<Types.ObjectId[]> {
    const project = await this.findProjectById(projectId);
    const members = await this.getMembers(project);
    return members.map((m) => m.id);
  }

  private async getMembers(project: ProjectDocument): Promise<MemberInfo[]> {
    // TODO: Реализовать полную логику с командами, когда будет сервис команд
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

    return populatedProject.accessControlUsers.map((user) => {
      const userObj = user.userId as any;
      return {
        id: userObj._id,
        nickname: userObj.nickname,
        avatar: userObj.avatar,
        role: user.role,
        team: undefined,
        teamId: undefined,
      };
    });
  }

  private async getUserRole(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<string | null> {
    const project = await this.findProjectById(projectId);
    const userAccess = project.accessControlUsers.find((user) =>
      user.userId.equals(userId),
    );

    if (userAccess) {
      return userAccess.role;
    }

    for (const teamAccess of project.accessControlTeams) {
      const individualOverride = teamAccess.individualOverrides.find(
        (override) => override.userId.equals(userId),
      );

      if (individualOverride) {
        return individualOverride.role;
      }

      // TODO: Заменить на реальную проверку, когда будет сервис команд
      const isUserInTeam = await this.isUserInTeam(teamAccess.teamId, userId);
      if (isUserInTeam) {
        return teamAccess.role;
      }
    }

    return null;
  }

  private async findProjectById(
    projectId: Types.ObjectId,
  ): Promise<ProjectDocument> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new CustomException(
        getErrorMessages({ project: 'invalidIdType' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.projectModel
      .findById(projectId)
      .orFail(
        () =>
          new CustomException(
            getErrorMessages({ project: 'idNotFound' }),
            HttpStatus.NOT_FOUND,
          ),
      )
      .exec();
  }

  private async addSectionToProject(
    project: ProjectDocument,
    name: string,
  ): Promise<Types.ObjectId> {
    const newSection = new this.sectionModel({ projectId: project._id, name });
    await newSection.save();

    project.sections.push(newSection._id);
    await project.save();

    return newSection._id;
  }

  private async addSectionToSection(
    projectId: Types.ObjectId,
    parentSectionId: Types.ObjectId,
    name: string,
  ): Promise<Types.ObjectId> {
    const parentSection = await this.sectionModel
      .findById(parentSectionId)
      .orFail(
        () =>
          new CustomException(
            getErrorMessages({ section: 'notFound' }),
            HttpStatus.NOT_FOUND,
          ),
      )
      .exec();
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

  private async validateUser(
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

  private async isUserInTeam(
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<boolean> {
    // TODO: Реализовать вызов сервиса команд, чтобы проверить пользователя
    return false;
  }
}
