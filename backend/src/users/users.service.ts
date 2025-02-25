import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { transliterate } from 'transliteration';
import { User } from './schemas/user.schema';
import { Counter } from './schemas/user-counter.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GoogleUserDto } from './dto/login-google.dto';
import { getErrorMessages } from '../errorMessages';
import { CustomException } from '../exceptions/custom-exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Counter') private counterModel: Model<Counter>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const [hashedPassword, nickname] = await Promise.all([
      this.hashPassword(createUserDto.password),
      this.generateNickname(),
    ]);

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      nickname,
    });
    return await this.saveUser(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<Partial<User>> {
    const user = await this.checkUserByEmail(loginUserDto.email);
    await this.verifyPassword(loginUserDto.password, user.password);
    return this.transformUserResponse(user);
  }

  async handleGoogleYandexUser(userDto: GoogleUserDto): Promise<Partial<User>> {
    const user = await this.userModel.findOne({ email: userDto.email });

    if (!user) {
      const nickname = await this.generateGoogleNickname(userDto.nickname);
      const newUser = new this.userModel({
        email: userDto.email,
        nickname,
        password: '',
      });
      return this.saveUser(newUser);
    }

    return this.transformUserResponse(user as User);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new CustomException(
        getErrorMessages({ id: 'notFound' }),
        HttpStatus.NOT_FOUND,
      );
    }
    return user as User;
  }

  async deleteAllUsers(): Promise<void> {
    await this.userModel.deleteMany({});
    await this.counterModel.updateOne({}, { count: 0 });
  }

  private async saveUser(newUser: User): Promise<Partial<User>> {
    await this.checkUniqueFields({
      email: newUser.email,
      nickname: newUser.nickname,
    });
    try {
      const user = await newUser.save();
      return this.transformUserResponse(user);
    } catch (error) {
      this.handleSaveUserError(error);
    }
  }

  private async generateNickname(): Promise<string> {
    let counter = await this.counterModel.findOne().exec();

    if (!counter) {
      const maxHoggyFoggy = await this.userModel
        .find({ nickname: { $regex: /^hoggyFoggy\d+$/ } })
        .sort({ nickname: -1 })
        .limit(1)
        .exec();

      const initialCounter =
        maxHoggyFoggy.length > 0
          ? parseInt(maxHoggyFoggy[0].nickname.replace('hoggyFoggy', ''), 10)
          : 0;

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

  private async generateGoogleNickname(
    originalNickname: string,
  ): Promise<string> {
    const transliteratedNickname = transliterate(originalNickname).replace(
      /\s+/g,
      '',
    );
    const isValidNickname =
      transliteratedNickname.length >= 3 && transliteratedNickname.length <= 20;
    const containsHoggyFoggy = transliteratedNickname.includes('hoggyFoggy');

    if (
      isValidNickname &&
      !containsHoggyFoggy &&
      !(await this.userModel.exists({ nickname: transliteratedNickname }))
    ) {
      return transliteratedNickname;
    }

    return this.generateNickname();
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async checkUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new CustomException(
        getErrorMessages({ email: 'notFound' }),
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }

  private async checkUniqueFields(fields: {
    email?: string;
    nickname?: string;
  }): Promise<void> {
    const checks = Object.keys(fields).map(
      async (field: keyof typeof fields) => {
        if (fields[field]) {
          const user = await this.userModel.findOne({ [field]: fields[field] });
          if (user) {
            throw new CustomException(
              getErrorMessages({ [field]: 'unique' }),
              HttpStatus.CONFLICT,
            );
          }
        }
      },
    );
    await Promise.all(checks);
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

  private transformUserResponse(user: User): Partial<User> {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
    };
  }

  private handleSaveUserError(error: any): never {
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
