import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/localStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const studentId = searchParams.get('studentId');
    const companyId = searchParams.get('companyId');

    const applications = await localStore.findApplications({ jobId, studentId, companyId });
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, studentId, studentName, studentEmail } = body;

    const existing = await localStore.findApplication(jobId, studentId);
    if (existing) {
      return NextResponse.json({ error: 'Already applied' }, { status: 400 });
    }

    const application = await localStore.createApplication({
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
