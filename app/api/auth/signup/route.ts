import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import StudentProfile from '@/models/StudentProfile';
import CompanyProfile from '@/models/CompanyProfile';
import { hash } from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, password, role, college, degree, skills, companyName, website, description } = body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword, role });

    if (role === 'student') {
      await StudentProfile.create({
        userId: user._id,
        college,
        degree,
        skills: skills || []
      });
    } else if (role === 'company') {
      await CompanyProfile.create({
        userId: user._id,
        companyName,
        website,
        description
      });
    }

    return NextResponse.json({ success: true, userId: user._id, role });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
