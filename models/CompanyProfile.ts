import mongoose from 'mongoose';

const companyProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  website: { type: String },
  description: { type: String },
}, { timestamps: true });

export default mongoose.models.CompanyProfile || mongoose.model('CompanyProfile', companyProfileSchema);
