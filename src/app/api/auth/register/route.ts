import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password, role, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        region: role || 'farmer', // using region field for role temporarily if role is not in schema
        isVerified: false,
      },
    });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to SmsLog (we use SmsLog as OTP storage)
    await prisma.smsLog.create({
      data: {
        userId: user.id,
        phone: email, // storing email in phone field for OTP lookup
        message: otp,
        type: 'otp',
        status: 'pending',
      },
    });

    console.log(`[DEV MODE] Generated OTP for email ${email}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'Registration successful. OTP sent.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
