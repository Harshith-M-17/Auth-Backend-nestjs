import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ maxlength: 80 })
  firstName?: string;

  @Prop({ maxlength: 80 })
  lastName?: string;

  @Prop({ unique: true, lowercase: true, sparse: true })
  email?: string;

  @Prop({ unique: true, sparse: true })
  phone?: string;

  @Prop({
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending',
  })
  status: 'pending' | 'active' | 'suspended';

  @Prop({
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: 'user' | 'admin';

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
