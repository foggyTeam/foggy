import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityType, NotificationType } from '../../shared/types/enums';
import {
  EntityReference,
  NotificationMetadata,
  Recipient,
} from '../../shared/interfaces/notification.type';

export type NotificationDocument = HydratedDocument<Notification> & {
  createdAt: Date;
};

@Schema({
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
})
export class Notification {
  @Prop({
    type: String,
    enum: NotificationType,
    required: true,
  })
  type: NotificationType;

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User', required: true },
        isRead: { type: Boolean, default: false },
        readAt: { type: Date, default: null },
      },
    ],
    required: true,
    _id: false,
  })
  recipients: Recipient[];

  @Prop({
    type: {
      type: { type: String, enum: EntityType, required: true },
      id: { type: Types.ObjectId, required: true, refPath: 'initiator.type' },
    },
    required: true,
    _id: false,
  })
  initiator: EntityReference;

  @Prop({
    type: {
      type: { type: String, enum: EntityType, required: true },
      id: { type: Types.ObjectId, required: true, refPath: 'target.type' },
    },
    required: true,
    _id: false,
  })
  target: EntityReference;

  @Prop({
    type: Object,
    required: true,
    validate: {
      validator: function (metadata: any) {
        return true;
      },
      message: 'Invalid metadata for notification type',
    },
  })
  metadata: NotificationMetadata;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({
  'recipients.userId': 1,
  'recipients.isRead': 1,
  createdAt: -1,
});
NotificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 366 * 24 * 3600 },
);
