import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { TeamService } from '../teams/team.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GoogleUserDto } from './dto/login-google.dto';
import { User } from './schemas/user.schema';
import { Types } from 'mongoose';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly teamService: TeamService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'User with this email or nickname already exists',
  })
  @ApiBody({
    description: 'User data to create a new user',
    examples: {
      example1: {
        value: {
          email: 'johndoe@gmail.com',
          password: '12345678a',
        },
      },
    },
  })
  async register(@Body() createUserDto: CreateUserDto): Promise<Partial<User>> {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    description: 'User data to login an user',
    examples: {
      example1: {
        value: {
          email: 'johndoe@gmail.com',
          password: '12345678a',
        },
      },
    },
  })
  async login(@Body() loginUserDto: LoginUserDto): Promise<Partial<User>> {
    return this.usersService.login(loginUserDto);
  }

  @Post('google-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login or register a user via Google/Yandex' })
  @ApiResponse({ status: 200, description: 'Login or registration successful' })
  @ApiResponse({ status: 409, description: 'User email already exists' })
  @ApiBody({
    description: 'User data from Google/Yandex',
    examples: {
      example1: {
        value: {
          email: 'user@gmail.com',
          nickname: 'Русское имя',
          avatar:
            'https://static-cdn.jtvnw.net/jtv_user_pictures/5221d54c-3507-42cc-bea4-2832cd1300d7-profile_image-70x70.png',
        },
      },
    },
  })
  async googleLogin(
    @Body() googleUserDto: GoogleUserDto,
  ): Promise<Partial<User>> {
    return this.usersService.handleGoogleYandexUser(googleUserDto);
  }

  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ status: 200, description: 'User information updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({
    description: 'Data to update user information',
    examples: {
      example1: {
        value: {
          password: 'newpassword123',
          nickname: 'newnickname',
          profileDescription: 'New description',
          avatar:
            'https://static-cdn.jtvnw.net/jtv_user_pictures/5221d54c-3507-42cc-bea4-2832cd1300d7-profile_image-70x70.png',
          settings: {
            emailNotifications: true,
            projectNotifications: false,
            teamNotifications: true,
          },
        },
      },
    },
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateData);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users successfully retrieved',
  })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiResponse({ status: 200, description: 'User successfully retrieved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.findUserById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: 204, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUserById(@Param('id') id: string): Promise<void> {
    return this.usersService.deleteUserById(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all users and reset counter' })
  @ApiResponse({
    status: 200,
    description: 'All users successfully deleted and counter reset',
  })
  async deleteAllUsers(): Promise<void> {
    return this.usersService.deleteAllUsers();
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search users for adding to project or team' })
  @ApiResponse({
    status: 200,
    description: 'List of users matching the search criteria',
  })
  @ApiBody({
    description: 'Search parameters',
    schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for nickname',
          example: 'hoggy',
        },
        projectId: {
          type: 'string',
          description: 'Project ID to exclude its members',
          example: '65a8e5c9d8df1f04e8e3b4a2',
        },
        teamId: {
          type: 'string',
          description: 'Team ID to exclude its members',
          example: '65a8e5c9d8df1f04e8e3b4a2',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (1-100)',
          example: 20,
        },
        cursor: {
          type: 'string',
          description: 'Cursor for pagination',
          example: '65a8e5c9d8df1f04e8e3b4a2',
        },
      },
    },
  })
  async searchUsers(
    @Body('query') query: string = '',
    @Body('projectId') projectId?: string,
    @Body('teamId') teamId?: string,
    @Body('limit') limit: number = 20,
    @Body('cursor') cursor?: string,
  ) {
    if (projectId) {
      return this.usersService.searchUsers(
        query,
        { type: 'project', id: new Types.ObjectId(projectId) },
        Number(limit),
        cursor,
      );
    }

    if (teamId) {
      return this.usersService.searchUsers(
        query,
        { type: 'team', id: new Types.ObjectId(teamId) },
        Number(limit),
        cursor,
      );
    }

    return this.usersService.searchUsers(
      query,
      undefined,
      Number(limit),
      cursor,
    );
  }

  @Post('search-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search users and teams combined for adding to project',
  })
  @ApiResponse({
    status: 200,
    description:
      'Combined list of users and teams matching the search criteria',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              nickname: { type: 'string' },
              avatar: { type: 'string' },
            },
          },
        },
        teams: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              avatar: { type: 'string' },
              memberCount: { type: 'number' },
            },
          },
        },
        usersNextCursor: { type: 'string', nullable: true },
        teamsNextCursor: { type: 'string', nullable: true },
        hasMoreUsers: { type: 'boolean' },
        hasMoreTeams: { type: 'boolean' },
      },
    },
  })
  @ApiBody({
    description: 'Search parameters for combined search',
    schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for nickname or team name',
          example: 'hoggy',
        },
        projectId: {
          type: 'string',
          description: 'Project ID to exclude its members and teams',
          example: '65a8e5c9d8df1f04e8e3b4a2',
        },
        usersLimit: {
          type: 'number',
          description: 'Maximum number of users results (1-100)',
          example: 10,
        },
        teamsLimit: {
          type: 'number',
          description: 'Maximum number of teams results (1-100)',
          example: 10,
        },
        usersCursor: {
          type: 'string',
          description: 'Cursor for users pagination',
          example: '65a8e5c9d8df1f04e8e3b4a2',
        },
        teamsCursor: {
          type: 'string',
          description: 'Cursor for teams pagination',
          example: '65a8e5c9d8df1f04e8e3b4a2',
        },
      },
    },
  })
  async searchAll(
    @Body('query') query: string = '',
    @Body('projectId') projectId?: string,
    @Body('usersLimit') usersLimit: number = 10,
    @Body('teamsLimit') teamsLimit: number = 10,
    @Body('usersCursor') usersCursor?: string,
    @Body('teamsCursor') teamsCursor?: string,
  ) {
    const usersResult = await this.usersService.searchUsers(
      query,
      projectId
        ? { type: 'project', id: new Types.ObjectId(projectId) }
        : undefined,
      Number(usersLimit),
      usersCursor,
    );

    const teamsResult = await this.teamService.searchTeams(
      query,
      projectId ? new Types.ObjectId(projectId) : undefined,
      Number(teamsLimit),
      teamsCursor,
    );

    return {
      users: usersResult.users.map((user) => ({
        id: user.id.toString(),
        nickname: user.nickname,
        avatar: user.avatar,
      })),
      teams: teamsResult.teams.map((team) => ({
        id: team.id.toString(),
        name: team.name,
        avatar: team.avatar,
        memberCount: team.memberCount || 0,
      })),
      usersNextCursor: usersResult.nextCursor,
      teamsNextCursor: teamsResult.nextCursor,
      hasMoreUsers: usersResult.hasNextPage,
      hasMoreTeams: teamsResult.hasNextPage,
    };
  }
}
