import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/db";
import Area from "@/app/modelNew/Area";
import Machine from "@/app/modelNew/Machine";
import OEM from "@/app/modelNew/OEM";
import Part from "@/app/modelNew/Part";
import User from "@/app/modelNew/User";

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const session = await getServerSession(request as any, response as any, authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { area, machine, machineNo, oem, partNo, partDetail, installedQuantity, availableQuantity } = await request.json();

    const userEmail = session.user.email;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Rest of your POST logic remains the same...
  } catch (error) {
    console.error("Data insertion error:", error);
    return NextResponse.json({ error: "Failed to insert data" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, response: NextResponse) {
  try {
    const session = await getServerSession(request as any, response as any, authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const parts = await Part.find()
      .populate('machine')
      .populate('OEM')
      .exec();

    return NextResponse.json(parts, { status: 200 });
  } catch (error) {
    console.error("Data retrieval error:", error);
    return NextResponse.json({ error: "Failed to retrieve data" }, { status: 500 });
  }
}