import { Document } from 'mongoose';
export declare class User extends Document {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    status: 'pending' | 'active' | 'suspended';
    role: 'user' | 'admin';
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
}>;
