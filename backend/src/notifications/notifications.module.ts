import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notifications.service';
import { NotificationController } from './notifications.controller';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { ProjectModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { TeamModule } from '../teams/teams.module';
import { Team, TeamSchema } from '../teams/schemas/team.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    forwardRef(() => ProjectModule),
    forwardRef(() => TeamModule),
    forwardRef(() => UsersModule),
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Team.name, schema: TeamSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService, MongooseModule],
})
export class NotificationsModule {}
