import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/localStore';
import { compare } from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const user = await localStore.findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await localStore.findStudentProfileByUserId(user._id);
    } else if (user.role === 'company') {
      profile = await localStore.findCompanyProfileByUserId(user._id);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
