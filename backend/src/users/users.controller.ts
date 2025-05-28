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
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GoogleUserDto } from './dto/login-google.dto';
import { User } from './schemas/user.schema';
import { Types } from 'mongoose';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  @ApiOperation({ summary: 'Search users for adding to project' })
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
    @Body('limit') limit: number = 20,
    @Body('cursor') cursor?: string,
  ) {
    const parsedProjectId = projectId
      ? new Types.ObjectId(projectId)
      : undefined;

    return this.usersService.searchUsers(query, parsedProjectId, limit, cursor);
  }
}
