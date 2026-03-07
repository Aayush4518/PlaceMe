import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Application from '@/models/Application';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const studentId = searchParams.get('studentId');
    const companyId = searchParams.get('companyId');

    let query: any = {};

    if (jobId) query.jobId = jobId;
    if (studentId) query.studentId = studentId;
    if (companyId) {
      const JobListing = (await import('@/models/JobListing')).default;
      const jobs = await JobListing.find({ companyId });
      const jobIds = jobs.map((j: any) => j._id);
      query.jobId = { $in: jobIds };
    }

    const applications = await Application.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { jobId, studentId, studentName, studentEmail } = body;

    const existing = await Application.findOne({ jobId, studentId });
    if (existing) {
      return NextResponse.json({ error: 'Already applied' }, { status: 400 });
    }

    const application = await Application.create({
      jobId,
      studentId,
      studentName,
      studentEmail
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Apply error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
