import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Project, ProjectSchema } from './schemas/project.schema';
import { Section, SectionSchema } from './schemas/section.schema';
import { UsersModule } from '../users/users.module';
import { BoardModule } from '../board/board.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Section.name, schema: SectionSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => BoardModule),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService, MongooseModule],
})
export class ProjectModule {}
