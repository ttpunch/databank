import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from '@/app/lib/db';
import OEM from '@/app/models/Oem';
import User from '@/app/models/User';
import { authOptions } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name } = await req.json();
    const user = await User.findOne({ email: session.user.email });

    const newOEM = new OEM({
      name,
      addedBy: user._id,
    });

    await newOEM.save();
    return NextResponse.json(newOEM, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}