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
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ProjectService } from './project.service';
import { Project, Role } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
    type: Project,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiBody({ type: CreateProjectDto })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<Project> {
    return this.projectService.createProject(
      createProjectDto,
      new Types.ObjectId(userId),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all projects for current user' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of projects.',
    type: [Project],
  })
  async findAll(@Headers('x-user-id') userId: Types.ObjectId): Promise<Project[]> {
    return this.projectService.getAllUserProjects(new Types.ObjectId(userId));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID',
    required: true,
  })
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
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID',
    required: true,
  })
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
  @ApiBody({ type: UpdateProjectDto })
  async update(
    @Param('id') id: Types.ObjectId,
    @Body() updateProjectDto: UpdateProjectDto,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<Project> {
    return this.projectService.updateProjectInfo(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID',
    required: true,
  })
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
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID making the request',
    required: true,
  })
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
    @Body('userId') userId: Types.ObjectId,
    @Body('role') role: Role,
    @Headers('x-user-id') requestingUserId: Types.ObjectId,
  ): Promise<Project> {
    return this.projectService.addUser(projectId, userId, role);
  }

  @Delete(':id/users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove user from project' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID making the request',
    required: true,
  })
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
    @Param('userId') userId: Types.ObjectId,
    @Headers('x-user-id') requestingUserId: Types.ObjectId,
  ): Promise<Project> {
    return this.projectService.removeUser(projectId, userId);
  }

  @Put(':id/users/:userId/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user role in project' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID making the request',
    required: true,
  })
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
    @Param('userId') userId: Types.ObjectId,
    @Body('role') newRole: Role,
    @Headers('x-user-id') requestingUserId: Types.ObjectId,
  ): Promise<Project> {
    return this.projectService.updateUserRole(projectId, userId, newRole);
  }

  @Get(':id/access-control')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get project access control list' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID',
    required: true,
  })
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
          team: { type: 'string', nullable: true },
          teamRole: { type: 'string', nullable: true },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getAccessControlList(
    @Param('id') projectId: Types.ObjectId,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<any[]> {
    return this.projectService.getAccessControlList(projectId);
  }

  @Post(':id/sections')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add section to project' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID',
    required: true,
  })
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
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID',
    required: true,
  })
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
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID',
    required: true,
  })
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
    return this.projectService.getSection(projectId, sectionId);
  }

  @Delete(':id/sections/:sectionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove section from project' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID',
    required: true,
  })
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
    await this.projectService.removeSection(projectId, sectionId);
  }

  @Post(':id/teams')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'Add team to project (not implemented)' })
  async addTeamToProject(): Promise<void> {
    throw new Error('Not implemented');
  }

  @Delete(':id/teams/:teamId')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'Remove team from project (not implemented)' })
  async removeTeamFromProject(): Promise<void> {
    throw new Error('Not implemented');
  }

  @Put(':id/teams/:teamId/role')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'Update team role in project (not implemented)' })
  async updateTeamRoleInProject(): Promise<void> {
    throw new Error('Not implemented');
  }
}
