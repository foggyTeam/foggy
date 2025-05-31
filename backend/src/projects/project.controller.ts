import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ProjectService } from './project.service';
import {
  ChildSection,
  ExtendedProjectListItem,
  Project,
  ProjectListItem,
} from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SectionDocument } from './schemas/section.schema';
import { CreateSectionDto } from './dto/create-section.dto';
import { ChangeSectionParentDto } from './dto/change-section-parent.dto';
import { ChangeBoardSectionDto } from './dto/change-board-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Role } from '../shared/types/enums';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiSecurity('x-user-id')
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiBody({
    description: 'Data for the new project',
    examples: {
      example1: {
        summary: 'Simple project example',
        value: {
          name: 'My Project',
          description: 'Project description',
          avatar: 'url',
          settings: {
            allowRequests: true,
            isPublic: true,
            memberListIsPublic: true,
          },
        },
      },
    },
  })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<{ data: { id: Types.ObjectId } }> {
    const projectId = await this.projectService.createProject(
      createProjectDto,
      userId,
    );
    return { data: { id: projectId } };
  }

  @Post(':id/users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add user to project' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the project',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully added to project',
    type: Project,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 409, description: 'User already in project' })
  @ApiBody({
    description: 'User and role data',
    examples: {
      example1: {
        summary: 'Add user as editor',
        value: {
          userId: '507f1f77bcf86cd799439011',
          role: 'editor',
        },
      },
      example2: {
        summary: 'Add user as reader',
        value: {
          userId: '507f1f77bcf86cd799439012',
          role: 'reader',
        },
      },
    },
  })
  async addUser(
    @Param('id') projectId: Types.ObjectId,
    @Body('userId') targetUserId: Types.ObjectId,
    @Body('role') role: Role,
    @Headers('x-user-id') requestingUserId: Types.ObjectId,
  ): Promise<Project> {
    return this.projectService.addUser(
      projectId,
      requestingUserId,
      targetUserId,
      role,
    );
  }

  @Post(':id/sections')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add section to project or to parent section' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the project',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Section has been successfully added',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden - no permission' })
  @ApiBody({ type: CreateSectionDto })
  async addSection(
    @Param('id') projectId: Types.ObjectId,
    @Body() createSectionDto: CreateSectionDto,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<{ data: { id: Types.ObjectId } }> {
    const sectionId = await this.projectService.addSection(
      new Types.ObjectId(projectId),
      new Types.ObjectId(userId),
      {
        ...createSectionDto,
        parentSectionId: createSectionDto.parentSectionId
          ? new Types.ObjectId(createSectionDto.parentSectionId)
          : undefined,
      },
    );
    return { data: { id: sectionId } };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all projects for current user' })
  @ApiSecurity('x-user-id')
  @ApiResponse({
    status: 200,
    description: 'Returns an array of projects.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          avatar: { type: 'string' },
          description: { type: 'string', nullable: true },
          updatedAt: { type: 'string', format: 'date-time' },
          members: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                avatar: { type: 'string' },
                role: {
                  type: 'string',
                  enum: ['owner', 'admin', 'editor', 'reader'],
                },
                team: { type: 'string', nullable: true },
                teamId: { type: 'string', nullable: true },
              },
            },
          },
        },
      },
    },
  })
  async findAll(
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<ProjectListItem[]> {
    return this.projectService.getAllUserProjects(new Types.ObjectId(userId));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get project by ID with sections hierarchy' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Valid MongoDB ObjectID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the project with sections hierarchy',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        avatar: { type: 'string' },
        description: { type: 'string', nullable: true },
        updatedAt: { type: 'string', format: 'date-time' },
        settings: {
          type: 'object',
          properties: {
            allowRequests: { type: 'boolean' },
            isPublic: { type: 'boolean' },
            memberListIsPublic: { type: 'boolean' },
          },
        },
        members: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              nickname: { type: 'string' },
              avatar: { type: 'string' },
              role: {
                type: 'string',
                enum: ['owner', 'admin', 'editor', 'reader'],
              },
              team: { type: 'string', nullable: true },
              teamId: { type: 'string', nullable: true },
            },
          },
        },
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              parentId: { type: 'string', nullable: true },
              name: { type: 'string' },
              childrenNumber: { type: 'number' },
              children: {
                type: 'array',
                items: {
                  oneOf: [
                    {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        parentId: { type: 'string' },
                        name: { type: 'string' },
                        childrenNumber: { type: 'number' },
                        children: { type: 'array', items: {} },
                      },
                    },
                    {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        sectionId: { type: 'string' },
                        name: { type: 'string' },
                        type: { type: 'string' },
                        updatedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findById(
    @Param('id') projectId: Types.ObjectId,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<ExtendedProjectListItem> {
    return this.projectService.getProjectById(
      new Types.ObjectId(projectId),
      new Types.ObjectId(userId),
    );
  }

  @Get(':id/sections/:sectionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get section with children' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the project',
    type: String,
  })
  @ApiParam({
    name: 'sectionId',
    description: 'ID of the section',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns section children items',
  })
  @ApiResponse({ status: 404, description: 'Project or section not found' })
  async getSection(
    @Param('id') projectId: Types.ObjectId,
    @Param('sectionId') sectionId: Types.ObjectId,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<ChildSection> {
    return this.projectService.getSection(
      new Types.ObjectId(projectId),
      new Types.ObjectId(sectionId),
      new Types.ObjectId(userId),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Partially update project information' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the project',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully updated',
    type: Project,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBody({
    description: 'Data to update the project',
    examples: {
      example1: {
        summary: 'Update name and description',
        value: {
          name: 'Updated Project Name',
          description: 'Updated project description',
        },
      },
      example2: {
        summary: 'Update settings',
        value: {
          settings: {
            isPublic: true,
            memberListIsPublic: true,
          },
        },
      },
    },
  })
  async update(
    @Param('id') id: Types.ObjectId,
    @Body() updateProjectDto: UpdateProjectDto,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<void> {
    return this.projectService.updateProjectInfo(id, updateProjectDto, userId);
  }

  @Patch(':id/users/:userId/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user role in project' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the project',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User role has been successfully updated',
    type: Project,
  })
  @ApiResponse({ status: 404, description: 'Project or user not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - cannot change owner role',
  })
  @ApiBody({
    description: 'New role for user',
    examples: {
      example1: {
        summary: 'Change role to admin',
        value: {
          userId: '507f1f77bcf86cd799439012',
          role: 'admin',
        },
      },
      example2: {
        summary: 'Change role to reader',
        value: {
          userId: '507f1f77bcf86cd799439012',
          role: 'reader',
        },
      },
    },
  })
  async updateUserRole(
    @Param('id') projectId: Types.ObjectId,
    @Body('userId') targetUserId: Types.ObjectId,
    @Body('role') newRole: Role,
    @Headers('x-user-id') requestingUserId: Types.ObjectId,
  ): Promise<Project> {
    return this.projectService.updateUserRole(
      projectId,
      requestingUserId,
      targetUserId,
      newRole,
    );
  }

  @Patch(':id/sections/:sectionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update section name' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the project',
    type: String,
  })
  @ApiParam({
    name: 'sectionId',
    description: 'ID of the section to update',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Section name has been successfully updated',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden - no permission' })
  @ApiResponse({ status: 404, description: 'Project or section not found' })
  @ApiBody({ type: UpdateSectionDto })
  async updateSection(
    @Param('id') projectId: Types.ObjectId,
    @Param('sectionId') sectionId: Types.ObjectId,
    @Body() updateSectionDto: UpdateSectionDto,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<void> {
    await this.projectService.updateSection(
      new Types.ObjectId(projectId),
      new Types.ObjectId(sectionId),
      updateSectionDto,
      new Types.ObjectId(userId),
    );
  }

  @Patch(':id/sections/boards/:boardId/section')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change board section' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the project',
    type: String,
  })
  @ApiParam({
    name: 'boardId',
    description: 'ID of the board to move',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Board section has been successfully changed',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden - no permission' })
  @ApiResponse({
    status: 404,
    description: 'Project, board or section not found',
  })
  async changeBoardSection(
    @Param('id') projectId: Types.ObjectId,
    @Param('boardId') boardId: Types.ObjectId,
    @Body() changeBoardSectionDto: ChangeBoardSectionDto,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<void> {
    return this.projectService.changeBoardSection(
      projectId,
      boardId,
      changeBoardSectionDto,
      userId,
    );
  }

  @Patch(':id/sections/:sectionId/parent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change section parent' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the project',
    type: String,
  })
  @ApiParam({
    name: 'sectionId',
    description: 'ID of the section to move',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Section parent has been successfully changed',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden - no permission' })
  @ApiResponse({ status: 404, description: 'Project or section not found' })
  async changeSectionParent(
    @Param('id') projectId: Types.ObjectId,
    @Param('sectionId') sectionId: Types.ObjectId,
    @Body() changeSectionParentDto: ChangeSectionParentDto,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<SectionDocument> {
    return this.projectService.changeSectionParent(
      projectId,
      sectionId,
      changeSectionParentDto,
      userId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Valid MongoDB ObjectID',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'The project was successfully deleted',
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not an owner' })
  async delete(
    @Param('id') projectId: Types.ObjectId,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<void> {
    return this.projectService.deleteProject(projectId, userId);
  }

  @Delete(':id/users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove user from project' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the project',
    type: String,
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to remove',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully removed from project',
    type: Project,
  })
  @ApiResponse({ status: 404, description: 'Project or user not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot remove owner' })
  async removeUser(
    @Param('id') projectId: Types.ObjectId,
    @Param('userId') targetUserId: Types.ObjectId,
    @Headers('x-user-id') requestingUserId: Types.ObjectId,
  ): Promise<Project> {
    return this.projectService.removeUser(
      projectId,
      requestingUserId,
      targetUserId,
    );
  }

  @Delete(':id/sections/:sectionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete section' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the project',
    type: String,
  })
  @ApiParam({
    name: 'sectionId',
    description: 'ID of the section to remove',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Section has been successfully removed',
  })
  @ApiResponse({ status: 404, description: 'Project or section not found' })
  async removeSection(
    @Param('id') projectId: Types.ObjectId,
    @Param('sectionId') sectionId: Types.ObjectId,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<void> {
    await this.projectService.removeSection(
      new Types.ObjectId(projectId),
      new Types.ObjectId(sectionId),
      userId,
    );
  }

  @Post(':id/teams')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'Add team to project (not implemented)' })
  @ApiBody({
    description: 'Team data',
    examples: {
      example1: {
        summary: 'Add team to project',
        value: {
          teamId: '507f1f77bcf86cd799439013',
          role: 'editor',
        },
      },
    },
  })
  async addTeamToProject(): Promise<void> {
    throw new Error('Not implemented');
  }

  @Delete(':id/teams/:teamId')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'Remove team from project (not implemented)' })
  @ApiBody({
    description: 'Team ID',
    examples: {
      example1: {
        summary: 'Remove team from project',
        value: {
          teamId: '507f1f77bcf86cd799439013',
        },
      },
    },
  })
  async removeTeamFromProject(): Promise<void> {
    throw new Error('Not implemented');
  }

  @Put(':id/teams/:teamId/role')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'Update team role in project (not implemented)' })
  @ApiBody({
    description: 'New role for team',
    examples: {
      example1: {
        summary: 'Update team role',
        value: {
          role: 'admin',
        },
      },
    },
  })
  async updateTeamRoleInProject(): Promise<void> {
    throw new Error('Not implemented');
  }
}
