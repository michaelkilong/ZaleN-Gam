import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemLog extends Document {
  action: string;
  userId?: mongoose.Types.ObjectId;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}

const SystemLogSchema = new Schema<ISystemLog>({
  action: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'StaffUser' },
  targetId: { type: String },
  details: { type: String },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
});

SystemLogSchema.index({ createdAt: -1 });

export const SystemLog = mongoose.models.SystemLog || mongoose.model<ISystemLog>('SystemLog', SystemLogSchema);
