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
import { TeamService } from './team.service';
import { Team, TeamDocument, TeamListItem } from './schemas/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ChangeTeamMemberRoleDto } from './dto/change-team-member-role.dto';
import { Role } from '../shared/types/enums';

@ApiTags('teams')
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new team' })
  @ApiSecurity('x-user-id')
  @ApiResponse({
    status: 201,
    description: 'The team has been successfully created.',
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
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<{ data: { id: Types.ObjectId } }> {
    const teamId = await this.teamService.createTeam(createTeamDto, userId);
    return { data: { id: teamId } };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all teams for current user' })
  @ApiSecurity('x-user-id')
  @ApiResponse({
    status: 200,
    description: 'Returns an array of teams.',
  })
  async findAll(
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<TeamListItem[]> {
    return this.teamService.getUserTeams(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get team by ID' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Valid MongoDB ObjectID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the team details',
    type: Team,
  })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async findById(
    @Param('id') teamId: Types.ObjectId,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<TeamDocument> {
    return this.teamService.getTeamById(teamId, userId);
  }

  @Get(':id/brief')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get public brief information about team' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Valid MongoDB ObjectID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns brief public information about team',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        avatar: { type: 'string' },
        description: { type: 'string', nullable: true },
        memberCount: { type: 'number' },
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
              joinedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        updatedAt: { type: 'string', format: 'date-time' },
        settings: {
          type: 'object',
          properties: {
            allowRequests: { type: 'boolean' },
            memberListIsPublic: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiResponse({ status: 403, description: 'Team is not public' })
  @ApiResponse({
    status: 409,
    description: 'User already a member of this team',
  })
  async getTeamBriefInfo(
    @Param('id') teamId: Types.ObjectId,
    @Headers('x-user-id') userId?: Types.ObjectId,
  ): Promise<any> {
    return this.teamService.getTeamBriefInfo(teamId, userId);
  }

  @Get(':id/projects')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all projects for a team' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Valid MongoDB ObjectID of the team',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of team projects',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          avatar: { type: 'string' },
          description: { type: 'string', nullable: true },
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
              },
            },
          },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async getTeamProjects(
    @Param('id') teamId: Types.ObjectId,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<any[]> {
    return this.teamService.getTeamProjects(teamId, userId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update team information' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the team',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Team has been successfully updated',
    type: Team,
  })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async update(
    @Param('id') teamId: Types.ObjectId,
    @Body() updateTeamDto: UpdateTeamDto,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<TeamDocument> {
    return this.teamService.updateTeam(teamId, updateTeamDto, userId);
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invite member to team' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the team',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Member has been successfully added to team',
  })
  @ApiResponse({ status: 404, description: 'Team or user not found' })
  @ApiResponse({ status: 409, description: 'User already in team' })
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
    },
  })
  async inviteMember(
    @Param('id') teamId: Types.ObjectId,
    @Body('userId') targetUserId: Types.ObjectId,
    @Body('role') role: Role,
    @Headers('x-user-id') requestingUserId: Types.ObjectId,
  ): Promise<void> {
    return this.teamService.inviteMember(
      teamId,
      targetUserId,
      role,
      requestingUserId,
    );
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove member from team' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the team',
    type: String,
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to remove',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Member has been successfully removed from team',
  })
  @ApiResponse({ status: 404, description: 'Team or user not found' })
  async removeMember(
    @Param('id') teamId: Types.ObjectId,
    @Param('userId') targetUserId: Types.ObjectId,
    @Headers('x-user-id') requestingUserId: Types.ObjectId,
  ): Promise<void> {
    return this.teamService.removeMember(
      teamId,
      targetUserId,
      requestingUserId,
    );
  }

  @Patch(':id/members/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change member role in team' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    description: 'ID of the team',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Member role has been successfully updated',
    type: Team,
  })
  @ApiResponse({ status: 404, description: 'Team or user not found' })
  @ApiBody({ type: ChangeTeamMemberRoleDto })
  async changeMemberRole(
    @Param('id') teamId: Types.ObjectId,
    @Body() changeRoleDto: ChangeTeamMemberRoleDto,
    @Headers('x-user-id') requestingUserId: Types.ObjectId,
  ): Promise<TeamDocument> {
    return this.teamService.changeMemberRole(
      teamId,
      changeRoleDto,
      requestingUserId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a team' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Valid MongoDB ObjectID',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'The team was successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async delete(
    @Param('id') teamId: Types.ObjectId,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<void> {
    return this.teamService.deleteTeam(teamId, userId);
  }

  @Delete(':id/projects/:projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove project from team' })
  @ApiSecurity('x-user-id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Valid MongoDB ObjectID of the team',
    type: String,
  })
  @ApiParam({
    name: 'projectId',
    required: true,
    description: 'Valid MongoDB ObjectID of the project',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Project has been successfully removed from team',
  })
  @ApiResponse({ status: 404, description: 'Team or project not found' })
  async leaveProject(
    @Param('id') teamId: Types.ObjectId,
    @Param('projectId') projectId: Types.ObjectId,
    @Headers('x-user-id') userId: Types.ObjectId,
  ): Promise<void> {
    return this.teamService.leaveProject(teamId, projectId, userId);
  }
}
