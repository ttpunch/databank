import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import mongoose from 'mongoose';
import { connectToDatabase } from '@/app/lib/db';
import Machine from '@/app/models/Machine';
import User from '@/app/models/User';
import { authOptions } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, machine_no, area, oem, parts } = await req.json();
    const user = await User.findOne({ email: session.user.email });

    const newMachine = new Machine({
      name,
      machine_no,
      area: new mongoose.Types.ObjectId(area),
      oem: new mongoose.Types.ObjectId(oem),
      parts: parts.map((id: string) => new mongoose.Types.ObjectId(id)),
      addedBy: user._id,
    });

    await newMachine.save();
    return NextResponse.json(newMachine, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}