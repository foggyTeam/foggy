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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    forwardRef(() => ProjectModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
