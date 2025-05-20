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
import { Project, Role } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SectionDocument } from './schemas/section.schema';

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
    type: Project,
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
        },
      },
    },
  })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<Project> {
    return this.projectService.createProject(createProjectDto, userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all projects for current user' })
  @ApiSecurity('x-user-id')
  @ApiResponse({
    status: 200,
    description: 'Returns an array of projects.',
    type: [Project],
  })
  async findAll(
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<Project[]> {
    return this.projectService.getAllUserProjects(new Types.ObjectId(userId));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Valid MongoDB ObjectID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the project document',
    type: Project,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findById(
    @Param('id') id: Types.ObjectId,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<Project> {
    return this.projectService.getProjectById(id, new Types.ObjectId(userId));
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
  ): Promise<Project> {
    return this.projectService.updateProjectInfo(id, updateProjectDto, userId);
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
    @Param('id') id: Types.ObjectId,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<void> {
    return this.projectService.deleteProject(id, new Types.ObjectId(userId));
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
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID to add' },
        role: { type: 'Role' },
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

  @Put(':id/users/:userId/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user role in project' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the project',
    type: String,
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to update',
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
    schema: {
      type: 'object',
      properties: {
        role: { type: 'Role' },
      },
    },
  })
  async updateUserRole(
    @Param('id') projectId: Types.ObjectId,
    @Param('userId') targetUserId: Types.ObjectId,
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

  @Get(':id/access-control')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get project access control list' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the project',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns access control list',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nickname: { type: 'string' },
          avatar: { type: 'string' },
          role: { type: 'Role' },
          team: { type: 'string' },
          teamRole: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getAccessControlList(
    @Param('id') projectId: Types.ObjectId,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<any[]> {
    return this.projectService.getAccessControlList(projectId, userId);
  }

  @Post(':id/sections')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add section to project' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the project',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Section has been successfully added to project',
    type: Project,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden - no permission' })
  @ApiBody({
    description: 'Section data',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
      },
    },
  })
  async addSectionToProject(
    @Param('id') projectId: Types.ObjectId,
    @Body('name') name: string,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<Project> {
    return this.projectService.addSectionToProject(
      projectId,
      name,
      new Types.ObjectId(userId),
    );
  }

  @Post('sections/:parentSectionId/sections')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add nested section to parent section' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'parentSectionId',
    description: 'ID of the parent section',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Section has been successfully added to parent section',
    type: Project,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden - no permission' })
  @ApiBody({
    description: 'Section data',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
      },
    },
  })
  async addSectionToSection(
    @Param('id') projectId: Types.ObjectId,
    @Param('parentSectionId') parentSectionId: Types.ObjectId,
    @Body('name') name: string,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<any> {
    return this.projectService.addSectionToSection(
      projectId,
      parentSectionId,
      name,
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
    description: 'Returns section with children items',
    schema: {
      type: 'object',
      properties: {
        section: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            parentId: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        children: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string', enum: ['board', 'section'] },
              lastChange: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Project or section not found' })
  async getSection(
    @Param('id') projectId: Types.ObjectId,
    @Param('sectionId') sectionId: Types.ObjectId,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<any> {
    return this.projectService.getSection(projectId, sectionId, userId);
  }

  @Delete(':id/sections/:sectionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove section from project' })
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
    await this.projectService.removeSection(projectId, sectionId, userId);
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
