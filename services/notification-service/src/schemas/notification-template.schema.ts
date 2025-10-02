import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationTemplateDocument = NotificationTemplate & Document;

export enum TemplateType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum TemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

@Schema({ timestamps: true })
export class NotificationTemplate {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true, enum: TemplateType })
  type: TemplateType;

  @Prop({ required: true, enum: Object.values(require('./notification.schema').NotificationCategory) })
  category: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  body: string;

  @Prop()
  htmlBody: string;

  @Prop({ type: [String], default: [] })
  variables: string[];

  @Prop({ enum: TemplateStatus, default: TemplateStatus.ACTIVE })
  status: TemplateStatus;

  @Prop()
  description: string;

  @Prop()
  language: string;

  @Prop({ default: 'en' })
  defaultLanguage: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop()
  lastUsedAt: Date;

  @Prop({ default: 0 })
  usageCount: number;
}

export const NotificationTemplateSchema = SchemaFactory.createForClass(NotificationTemplate);


