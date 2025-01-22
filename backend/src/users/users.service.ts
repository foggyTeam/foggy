import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { transliterate } from 'transliteration';
import { User } from '../schemas/user.schema';
import { Counter } from '../schemas/user-counter.schema';
import { CreateUserDto } from './create-user.dto';
import { LoginUserDto } from './login-user.dto';
import { GoogleUserDto } from './login-google.dto';
import { getErrorMessages } from '../errorMessages';
import { CustomException } from '../exceptions/custom-exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Counter') private counterModel: Model<Counter>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const nickname = await this.generateNickname();
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      nickname,
    });
    return this.saveUser(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    let user;
    try {
      user = await this.userModel.findOne({
        email: loginUserDto.email,
      });

      if (!user) {
        throw new CustomException(
          getErrorMessages({ email: 'notFound' }),
          HttpStatus.UNAUTHORIZED,
        );
      }

      const isPasswordValid = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new CustomException(
          getErrorMessages({ password: 'wrongPassword' }),
          HttpStatus.UNAUTHORIZED,
        );
      }

      return this.transformUserResponse(user);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async handleGoogleYandexUser(userDto: GoogleUserDto): Promise<User> {
    let user;
    try {
      user = await this.userModel.findOne({ googleYandexId: userDto.id });

      if (!user) {
        const originalNickname = userDto.nickname;
        const transliteratedNickname = transliterate(originalNickname);

        const isValidNickname =
          transliteratedNickname.length >= 3 &&
          transliteratedNickname.length <= 20;

        const nickname =
          isValidNickname &&
          !(await this.userModel.exists({ nickname: transliteratedNickname }))
            ? transliteratedNickname
            : await this.generateNickname();

        const newUser = new this.userModel({
          googleYandexId: userDto.id,
          email: userDto.email,
          nickname,
          password: '',
        });

        return this.saveUser(newUser);
      }

      return this.transformUserResponse(user);
    } catch (error) {
      if (error.code === 11000) {
        throw new CustomException(
          getErrorMessages({ email: 'unique' }),
          HttpStatus.CONFLICT,
        );
      }
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  private transformUserResponse(user: User): any {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
    };
  }

  private async saveUser(newUser: User): Promise<User> {
    try {
      const user = await newUser.save();
      return this.transformUserResponse(user);
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0] as 'email' | 'nickname';
        throw new CustomException(
          getErrorMessages({ [field]: 'unique' }),
          HttpStatus.CONFLICT,
        );
      }
      throw new CustomException(
        getErrorMessages({ general: 'errorNotRecognized' }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generateNickname(): Promise<string> {
    const counter = await this.counterModel
      .findOneAndUpdate({}, { $inc: { count: 1 } }, { new: true, upsert: true })
      .exec();

    if (!counter) {
      throw new Error('Failed to update counter');
    }

    return `hoggyFoggy${(counter as Counter).count}`;
  }
}
