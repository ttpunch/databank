import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import mongoose from 'mongoose';
import { connectToDatabase } from '@/app/lib/db';
import Area from '@/app/models/Area';
import User from '@/app/models/User';
import { authOptions } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description, machines } = await req.json();
    const user = await User.findOne({ email: session.user.email });

    const newArea = new Area({
      name,
      description,
      machines: machines.map((id: string) => new mongoose.Types.ObjectId(id)),
      owner: user._id,
    });

    await newArea.save();
    return NextResponse.json(newArea, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}