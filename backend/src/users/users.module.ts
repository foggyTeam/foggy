import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { Counter, CounterSchema } from './schemas/user-counter.schema';
import { ProjectModule } from '../projects/projects.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
    forwardRef(() => ProjectModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
