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
    const user = await this.findUserByEmail(loginUserDto.email);
    await this.verifyPassword(loginUserDto.password, user.password);
    return this.transformUserResponse(user);
  }

  private async findUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new CustomException(
        getErrorMessages({ email: 'notFound' }),
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }

  private async verifyPassword(
    inputPassword: string,
    storedPassword: string,
  ): Promise<void> {
    const isPasswordValid = await bcrypt.compare(inputPassword, storedPassword);
    if (!isPasswordValid) {
      throw new CustomException(
        getErrorMessages({ password: 'wrongPassword' }),
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async handleGoogleYandexUser(userDto: GoogleUserDto, token: string): Promise<User> {
    let user;
    try {
      user = await this.userModel.findOne({ email: userDto.email });

      if (!user) {
        const nickname = await this.generateGoogleNickname(userDto.nickname);
        const newUser = new this.userModel({
          email: userDto.email,
          nickname,
          password: '',
        });

        return this.saveUser(newUser);
      }

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

  private async generateGoogleNickname(originalNickname: string): Promise<string> {
    const transliteratedNickname = transliterate(originalNickname).replace(/\s+/g, '');
    const isValidNickname = transliteratedNickname.length >= 3 && transliteratedNickname.length <= 20;
    const containsHoggyFoggy = transliteratedNickname.includes('hoggyFoggy');

    if (isValidNickname && !containsHoggyFoggy && !(await this.userModel.exists({ nickname: transliteratedNickname }))) {
      return transliteratedNickname;
    }

    return await this.generateNickname();
  }

  private async generateNickname(): Promise<string> {
    let counter = await this.counterModel.findOne().exec();

    if (!counter) {
      const maxHoggyFoggyUser = await this.userModel
        .find({ nickname: { $regex: /^hoggyFoggy\d+$/ } })
        .sort({ nickname: -1 })
        .limit(1)
        .exec();

      let initialCounter = 0;
      if (maxHoggyFoggyUser.length > 0) {
        initialCounter = parseInt(
          maxHoggyFoggyUser[0].nickname.replace('hoggyFoggy', ''),
          10,
        );
      }

      counter = new this.counterModel({ count: initialCounter });
      await counter.save();
    } else {
      counter = await this.counterModel
        .findOneAndUpdate({}, { $inc: { count: 1 } }, { new: true })
        .exec();

      if (!counter) {
        throw new Error('Failed to update counter');
      }
    }

    return `hoggyFoggy${(counter as Counter).count}`;
  }
}
