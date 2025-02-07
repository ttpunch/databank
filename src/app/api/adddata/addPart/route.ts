import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import mongoose from 'mongoose';
import { connectToDatabase } from '@/app/lib/db';
import Part from '@/app/models/Part';
import User from '@/app/models/User';
import { authOptions } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const session = await  getServerSession (authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, machine, installedQuantity, availableQuantity } = await req.json();
    const user = await User.findOne({ email: session.user.email });

    const newPart = new Part({
      name,
      machine: new mongoose.Types.ObjectId(machine),
      installedQuantity,
      availableQuantity,
      addedBy: user._id,
    });

    await newPart.save();
    return NextResponse.json(newPart, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}