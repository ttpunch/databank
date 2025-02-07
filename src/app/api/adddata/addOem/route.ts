import { NextRequest, NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { connectToDatabase } from '@/app/lib/db';
import OEM from '@/app/models/Oem';
import User from '@/app/models/User';

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const session = await getSession({ req });
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, country } = await req.json();
    const user = await User.findOne({ email: session.user.email });

    const newOEM = new OEM({
      name,
      country,
      addedBy: user._id,
    });

    await newOEM.save();
    return NextResponse.json(newOEM, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}