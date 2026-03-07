import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import JobListing from '@/models/JobListing';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const companyId = searchParams.get('companyId');

    let query: any = {};

    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (companyId) query.companyId = companyId;

    const jobs = await JobListing.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { companyId, companyName, title, location, salary, type, description, skills, deadline } = body;

    const job = await JobListing.create({
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
