import mongoose, { Schema, Document, Model } from "mongoose";

export enum UserRole {
  VIEWER = "VIEWER",
  ANALYST = "ANALYST",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IUser extends Document {
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.VIEWER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of the model during Next.js hot reloading
const User: Model<IUser> =
  mongoose.models?.User || mongoose.model<IUser>("User", UserSchema);

export default User;
