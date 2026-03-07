import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  college: { type: String, required: true },
  degree: { type: String, required: true },
  skills: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.StudentProfile || mongoose.model('StudentProfile', studentProfileSchema);
