import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument, Role } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UsersService } from '../users/users.service';
import { getErrorMessages } from '../errorMessages/errorMessages';
import { CustomException } from '../exceptions/custom-exception';
import {
  PopulatedSectionItem,
  Section,
  SectionDocument,
} from './schemas/section.schema';
import { Board, BoardDocument } from '../board/schemas/board.schema';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    private readonly usersService: UsersService,
  ) {}

  async createProject(
    createProjectDto: CreateProjectDto,
    userId: Types.ObjectId,
  ): Promise<ProjectDocument> {
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

      return await newProject.save();
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

  async findProjectById(projectId: Types.ObjectId): Promise<ProjectDocument> {
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

  async getUserRole(
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

  async deleteProject(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    const project = await this.findProjectById(projectId);
    const userAccess = project.accessControlUsers.find((user) =>
      user.userId.equals(userId),
    );

    if (!userAccess || userAccess.role !== 'owner') {
      throw new CustomException(
        getErrorMessages({ project: 'CannotDelete' }),
        HttpStatus.FORBIDDEN,
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

  async removeSection(
    projectId: Types.ObjectId,
    sectionId: Types.ObjectId,
  ): Promise<ProjectDocument> {
    const project = await this.findProjectById(projectId);

    project.sections = project.sections.filter(
      (section) => !section.equals(sectionId),
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

  async getAllUserProjects(userId: Types.ObjectId): Promise<ProjectDocument[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new CustomException(
        getErrorMessages({ user: 'invalidIdType' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.projectModel
      .find({ 'accessControlUsers.userId': userId })
      .select('-__v')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getProjectById(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ProjectDocument> {
    return await this.projectModel
      .findOne({
        _id: projectId,
        'accessControlUsers.userId': userId,
      })
      .orFail(
        () =>
          new CustomException(
            getErrorMessages({ project: 'idNotFoundOrNoAccess' }),
            HttpStatus.NOT_FOUND,
          ),
      )
      .exec();
  }

  async addUser(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
    role: Role,
  ): Promise<ProjectDocument> {
    const project = await this.findProjectById(projectId);
    const userExists = project.accessControlUsers.some((user) =>
      user.userId.equals(userId),
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

    project.accessControlUsers.push({ userId, role });

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
    userId: Types.ObjectId,
  ): Promise<ProjectDocument> {
    const project = await this.findProjectById(projectId);
    const isOwner = project.accessControlUsers.some(
      (user) => user.userId.equals(userId) && user.role === 'owner',
    );

    if (isOwner) {
      throw new CustomException(
        getErrorMessages({ project: 'cannotRemoveOwner' }),
        HttpStatus.FORBIDDEN,
      );
    }

    project.accessControlUsers = project.accessControlUsers.filter(
      (user) => !user.userId.equals(userId),
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
    userId: Types.ObjectId,
    newRole: Role,
  ): Promise<ProjectDocument> {
    const project = await this.findProjectById(projectId);
    const isOwner = project.accessControlUsers.some(
      (user) => user.userId.equals(userId) && user.role === 'owner',
    );

    if (isOwner) {
      throw new CustomException(
        getErrorMessages({ project: 'cannotChangeOwnerRole' }),
        HttpStatus.FORBIDDEN,
      );
    }

    const userIndex = project.accessControlUsers.findIndex((user) =>
      user.userId.equals(userId),
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

  async getAccessControlList(projectId: Types.ObjectId): Promise<
    {
      id: string;
      nickname: string;
      avatar: string;
      role: Role;
      team?: string;
      teamRole?: string;
    }[]
  > {
    const project = await this.findProjectById(projectId);

    // TODO: Реализовать полную логику, когда будет сервис команд
    return project.accessControlUsers.map((user) => ({
      id: user.userId.toString(),
      nickname: `User ${user.userId.toString().substring(0, 6)}`,
      avatar: '',
      role: user.role,
    }));
  }

  async updateProjectInfo(
    projectId: Types.ObjectId,
    updateData: UpdateProjectDto,
  ): Promise<ProjectDocument> {
    const project = await this.findProjectById(projectId);

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
      return project;
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
  ): Promise<{
    id: string;
    name: string;
    childrenNumber: number;
    children: Array<{
      id: string;
      name: string;
      type: 'section' | 'board';
      updatedAt: Date;
    }>;
  }> {
    const section = await this.sectionModel
      .findById(sectionId)
      .populate<{ items: PopulatedSectionItem[] }>({
        path: 'items.itemId',
        select: 'name updatedAt',
      })
      .orFail(
        () =>
          new CustomException(
            getErrorMessages({ section: 'idNotFound' }),
            HttpStatus.NOT_FOUND,
          ),
      )
      .exec();

    const children = section.items.map((item) => ({
      id: item.itemId._id.toString(),
      name: item.itemId.name,
      type: item.type,
      updatedAt: item.itemId.updatedAt,
    }));

    return {
      id: section._id.toString(),
      name: section.name,
      childrenNumber: children.length,
      children,
    };
  }

  async addSectionToProject(
    projectId: Types.ObjectId,
    sectionName: string,
    userId: Types.ObjectId,
  ): Promise<ProjectDocument> {
    const project = await this.findProjectById(projectId);
    const userRole = await this.getUserRole(projectId, userId);

    if (!['owner', 'admin', 'editor'].includes(userRole)) {
      throw new CustomException(
        getErrorMessages({ project: 'noPermission' }),
        HttpStatus.FORBIDDEN,
      );
    }

    const newSection = new this.sectionModel({ name: sectionName });
    await newSection.save();

    project.sections.push(newSection._id);
    await project.save();

    return project;
  }

  async addSectionToSection(
    projectId: Types.ObjectId,
    parentSectionId: Types.ObjectId,
    sectionName: string,
    userId: Types.ObjectId,
  ): Promise<SectionDocument> {
    const parentSection = await this.sectionModel
      .findById(parentSectionId)
      .orFail(
        () =>
          new CustomException(
            getErrorMessages({ section: 'idNotFound' }),
            HttpStatus.NOT_FOUND,
          ),
      );

    const userRole = await this.getUserRole(projectId, userId);
    if (!['owner', 'admin', 'editor'].includes(userRole)) {
      throw new CustomException(
        getErrorMessages({ project: 'noPermission' }),
        HttpStatus.FORBIDDEN,
      );
    }

    const newSection = new this.sectionModel({
      name: sectionName,
      parent: parentSectionId,
    });
    await newSection.save();

    parentSection.items.push({ type: 'section', itemId: newSection._id });
    await parentSection.save();

    return parentSection;
  }

  // Методы для работы с командами (заглушки)
  async addTeamToProject(
    projectId: Types.ObjectId,
    teamId: Types.ObjectId,
    role: Role,
  ): Promise<void> {
    throw new CustomException(
      getErrorMessages({ feature: 'notImplemented' }),
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  async removeTeamFromProject(
    projectId: Types.ObjectId,
    teamId: Types.ObjectId,
  ): Promise<void> {
    throw new CustomException(
      getErrorMessages({ feature: 'notImplemented' }),
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  async updateTeamRoleInProject(
    projectId: Types.ObjectId,
    teamId: Types.ObjectId,
    newRole: Role,
  ): Promise<void> {
    throw new CustomException(
      getErrorMessages({ feature: 'notImplemented' }),
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  /**
   * Проверяет, является ли пользователь частью команды.
   * (Заглушка, пока сервис команд не реализован)
   * @param teamId - ID команды.
   * @param userId - ID пользователя.
   * @returns true, если пользователь в команде, иначе false.
   */
  private async isUserInTeam(
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<boolean> {
    // TODO: Реализовать вызов сервиса команд, чтобы проверить пользователя
    return false;
  }
}
