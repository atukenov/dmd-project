import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  BUSINESS_OWNER = 'businessOwner',
  CLIENT = 'client',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
