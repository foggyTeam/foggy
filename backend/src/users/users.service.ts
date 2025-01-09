import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { isEmail } from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../schemas/user.schema';
import { CreateUserDto } from './create-user.dto';
import { LoginUserDto } from './login-user.dto';
import { getErrorMessage } from '../errorMessages';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    try {
      return await newUser.save();
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0] as 'email' | 'nickname';
        throw new ConflictException(getErrorMessage(field, 'unique'));
      }
      throw new InternalServerErrorException(
        getErrorMessage('general', 'errorNotRecognized'),
      );
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    let user;
    try {
      if (isEmail(loginUserDto.userIdentifier)) {
        user = await this.userModel.findOne({
          email: loginUserDto.userIdentifier,
        });
      } else {
        user = await this.userModel.findOne({
          nickname: loginUserDto.userIdentifier,
        });
      }

      if (!user) {
        throw new UnauthorizedException(getErrorMessage('login', 'notFound'));
      }

      const isPasswordValid = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException(
          getErrorMessage('login', 'wrongPassword'),
        );
      }

      return { message: 'Login successful' };
    } catch (error) {
      throw new UnauthorizedException(
        error.message || getErrorMessage('general', 'errorNotRecognized'),
      );
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
