import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './create-user.dto';
import { LoginUserDto } from './login-user.dto';
import { GoogleUserDto } from './login-google.dto';
import { User } from '../schemas/user.schema';

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
        },
      },
    },
  })
  async googleLogin(
    @Body() googleUserDto: GoogleUserDto,
  ): Promise<Partial<User>> {
    return this.usersService.handleGoogleYandexUser(googleUserDto);
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

  @Delete()
  @ApiOperation({ summary: 'Delete all users and reset counter' })
  @ApiResponse({
    status: 200,
    description: 'All users successfully deleted and counter reset',
  })
  async deleteAllUsers(): Promise<void> {
    return this.usersService.deleteAllUsers();
  }
}
