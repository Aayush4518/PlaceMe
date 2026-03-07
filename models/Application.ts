import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobListing', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.models.Application || mongoose.model('Application', applicationSchema);
