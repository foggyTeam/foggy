import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NotificationType } from '../../shared/types/enums';
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

  @Prop({ type: Types.ObjectId, required: true })
  initiator: Types.ObjectId;

  @Prop({ type: Object, required: true })
  target: EntityReference;

  @Prop({
    type: Object,
    required: true,
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
  { 'metadata.expiresAt': 1 },
  { expireAfterSeconds: 0 },
);
