import mongoose, { Schema } from 'mongoose';
import { UserRole } from '../types';

export interface IUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar: string;
  address?: string;
  lat: number;
  lng: number;
  isBlocked: boolean;
  createdAt: string;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, default: 'password123' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ['customer', 'mechanic', 'admin'], default: 'customer' },
    avatar: { type: String, default: '' },
    address: { type: String, default: 'Mumbai, Maharashtra' },
    lat: { type: Number, default: 19.0760 },
    lng: { type: Number, default: 72.8777 },
    isBlocked: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
