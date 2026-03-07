import mongoose from 'mongoose';

const jobListingSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },
  companyName: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  type: { type: String, enum: ['Internship', 'Full-time'], required: true },
  description: { type: String, required: true },
  skills: [{ type: String }],
  deadline: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.JobListing || mongoose.model('JobListing', jobListingSchema);
