import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { CreateUserDto } from './create-user.dto';
import { LoginUserDto } from './login-user.dto';
import * as bcrypt from 'bcrypt';
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
    const user = await this.userModel.findOne({
      $or: [
        { email: loginUserDto.userIdentifier },
        { nickname: loginUserDto.userIdentifier },
      ],
    });
    console.log(user);
    if (user && (await bcrypt.compare(loginUserDto.password, user.password))) {
      return { message: 'Login successful' };
    }

    throw new Error('Invalid credentials');
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
