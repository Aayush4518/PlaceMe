import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/localStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const companyId = searchParams.get('companyId');

    const jobs = await localStore.findJobs({ type, location, search, companyId });
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, companyName, title, location, salary, type, description, skills, deadline } = body;

    const job = await localStore.createJob({
      companyId,
      companyName,
      title,
      location,
      salary,
      type,
      description,
      skills,
      deadline
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
