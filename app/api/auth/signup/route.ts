import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/localStore';
import { hash } from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, college, degree, skills, companyName, website, description } = body;

    const existingUser = await localStore.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);
    const user = await localStore.createUser({ name, email, password: hashedPassword, role });

    if (role === 'student') {
      await localStore.createStudentProfile({
        userId: user._id,
        college,
        degree,
        skills: skills || []
      });
    } else if (role === 'company') {
      await localStore.createCompanyProfile({
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
