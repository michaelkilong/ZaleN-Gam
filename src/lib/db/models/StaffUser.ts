import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStaffUser extends Document {
  name: string;
  email?: string;
  passwordHash: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR';
  isActive: boolean;
  mustChangePassword: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  lastLoginAt?: Date;
}

const StaffUserSchema = new Schema<IStaffUser>({
  name: { type: String, required: true },
  email: { type: String, sparse: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'], 
    required: true 
  },
  isActive: { type: Boolean, default: true },
  mustChangePassword: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'StaffUser' },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date },
});

StaffUserSchema.index({ email: 1 }, { unique: true, sparse: true });

export const StaffUser = mongoose.models.StaffUser || mongoose.model<IStaffUser>('StaffUser', StaffUserSchema);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
