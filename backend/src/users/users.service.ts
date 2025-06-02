import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { transliterate } from 'transliteration';
import { User, UserDocument } from './schemas/user.schema';
import { Counter } from './schemas/user-counter.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GoogleUserDto } from './dto/login-google.dto';
import { getErrorMessages } from '../errorMessages/errorMessages';
import { CustomException } from '../exceptions/custom-exception';
import { isURL } from 'class-validator';
import { ProjectService } from '../projects/project.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel('Counter') private counterModel: Model<Counter>,
    private readonly projectService: ProjectService,
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

  async handleGoogleYandexUser(
    userDto: GoogleUserDto,
  ): Promise<Partial<UserDocument>> {
    const user = await this.userModel.findOne({ email: userDto.email }).exec();

    if (!user) {
      const nickname = await this.generateGoogleNickname(userDto.nickname);
      if (userDto.avatar && !isURL(userDto.avatar)) {
        userDto.avatar = '';
      }
      const newUser = new this.userModel({
        email: userDto.email,
        nickname,
        password: '',
        avatar: userDto.avatar || '',
      });
      return this.saveUser(newUser);
    }

    return this.transformUserResponse(user);
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findUserById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new CustomException(
        getErrorMessages({ user: 'notFound' }),
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async deleteUserById(id: string): Promise<void> {
    try {
      await this.userModel.findByIdAndDelete(id);
    } catch (error) {
      this.handleSaveUserError(error);
    }
  }

  async deleteAllUsers(): Promise<void> {
    await this.userModel.deleteMany({});
    await this.counterModel.updateOne({}, { count: 0 });
  }

  async updateUser(
    userId: string,
    updateData: Partial<User>,
  ): Promise<UserDocument> {
    const user = await this.findUserById(userId);

    if (updateData.email) {
      throw new CustomException(
        getErrorMessages({ email: 'cannotChange' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      updateData.nickname &&
      !(await this.validateNickname(updateData.nickname))
    ) {
      throw new CustomException(
        getErrorMessages({ nickname: 'invalid' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (updateData.password) {
      updateData.password = await this.hashPassword(updateData.password);
    }

    if (updateData.settings) {
      user.settings = {
        ...user.settings,
        ...updateData.settings,
      };
      delete updateData.settings;
    }

    Object.assign(user, updateData);
    await user.save();

    return user;
  }

  async searchUsers(
    query: string,
    projectId?: Types.ObjectId,
    limit = 20,
    cursor?: string,
  ) {
    const validatedLimit = Math.min(Math.max(limit, 1), 100);

    const excludeIds = projectId
      ? await this.projectService.getProjectMemberIds(projectId)
      : [];

    const filter: any = {};
    if (query) {
      filter.nickname = { $regex: query, $options: 'i' };
    }
    filter._id = {
      ...(cursor && { $gt: new Types.ObjectId(cursor) }),
      ...(excludeIds.length && {
        $nin: excludeIds.map((id) => new Types.ObjectId(id)),
      }),
    };

    const users = await this.userModel
      .find(filter)
      .sort({ _id: 1 })
      .limit(validatedLimit)
      .select('nickname avatar _id')
      .exec();

    const nextCursor =
      users.length === validatedLimit ? users[users.length - 1]._id : null;

    return {
      users: users.map((u) => ({
        id: u._id,
        nickname: u.nickname,
        avatar: u.avatar,
      })),
      nextCursor,
      hasNextPage: Boolean(nextCursor),
    };
  }

  async getUserNicknames(
    userIds: Types.ObjectId[],
  ): Promise<{ _id: Types.ObjectId; nickname: string }[]> {
    return this.userModel
      .find({ _id: { $in: userIds } }, { _id: 1, nickname: 1 })
      .lean()
      .exec();
  }

  async getUsersWithSettings(
    userIds: Types.ObjectId[],
  ): Promise<{ _id: Types.ObjectId; settings?: any }[]> {
    return this.userModel
      .find({ _id: { $in: userIds } }, { _id: 1, settings: 1 })
      .lean()
      .exec();
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

    if (await this.validateNickname(transliteratedNickname)) {
      return transliteratedNickname;
    }

    return this.generateNickname();
  }

  private async validateNickname(nickname: string): Promise<boolean> {
    const isValidNickname = nickname.length >= 3 && nickname.length <= 20;
    const containsHoggyFoggy = nickname.includes('hoggyFoggy');

    return (
      isValidNickname &&
      !containsHoggyFoggy &&
      !(await this.userModel.exists({ nickname }))
    );
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async checkUserByEmail(email: string): Promise<UserDocument> {
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

  private transformUserResponse(user: UserDocument): Partial<UserDocument> {
    return {
      id: user._id,
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

  private async saveUser(
    newUser: UserDocument,
  ): Promise<Partial<UserDocument>> {
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
}
