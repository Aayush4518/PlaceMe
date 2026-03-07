import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'company';
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'company'], required: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
