import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/db";
import Area from "@/app/modelNew/Area";
import Machine from "@/app/modelNew/Machine";
import OEM from "@/app/modelNew/OEM";
import Part from "@/app/modelNew/Part";
import User from "@/app/modelNew/User";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log(session)

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

    // 🔹 Find or Create Area
    let areaDoc = await Area.findOne({ name: area });
    if (!areaDoc) {
      areaDoc = await Area.create({ name: area });
    }

    // 🔹 Find or Create Machine
    let machineDoc = await Machine.findOne({ name: machine, machineNo, area: areaDoc._id });
    if (!machineDoc) {
      machineDoc = await Machine.create({ name: machine, machineNo, area: areaDoc._id });
    }

    // 🔹 Find or Create OEM
    let oemDoc = await OEM.findOne({ name: oem });
    if (!oemDoc) {
      oemDoc = await OEM.create({ name: oem });
    }

    // 🔹 Insert Part
    const part = await Part.create({
      machine: machineDoc._id,
      OEM: oemDoc._id,
      partNo,
      partDetail,
      installedQuantity,
      availableQuantity
    });

    return NextResponse.json({ message: "Part added successfully", part }, { status: 201 });

  } catch (error) {
    console.error("Data insertion error:", error);
    return NextResponse.json({ error: "Failed to insert data" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const parts = await Part.aggregate([
      {
        $lookup: {
          from: Machine.collection.name, // Use the collection name from the Machine model
          localField: 'machine', // Field in the Part collection
          foreignField: '_id', // Field in the machines collection
          as: 'machineDetails',
        },
      },
      {
        $lookup: {
          from: OEM.collection.name, // Use the collection name from the OEM model
          localField: 'OEM', // Field in the Part collection
          foreignField: '_id', // Field in the oems collection
          as: 'oemDetails',
        },
      },
      {
        $unwind: {
          path: '$machineDetails',
          preserveNullAndEmptyArrays: true, // Keep parts even if no machine details
        },
      },
      {
        $unwind: {
          path: '$oemDetails',
          preserveNullAndEmptyArrays: true, // Keep parts even if no OEM details
        },
      },
      {
        $project: {
          _id: 1,
          machine: {
            _id: '$machineDetails._id',
            name: '$machineDetails.name',
            machineNo: '$machineDetails.machineNo',
            area: '$machineDetails.area',
            createdAt: '$machineDetails.createdAt',
            updatedAt: '$machineDetails.updatedAt',
            __v: '$machineDetails.__v',
          },
          OEM: {
            _id: '$oemDetails._id',
            name: '$oemDetails.name',
            createdAt: '$oemDetails.createdAt',
            updatedAt: '$oemDetails.updatedAt',
            __v: '$oemDetails.__v',
          },
          partNo: 1,
          partDetail: 1,
          installedQuantity: 1,
          availableQuantity: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]).exec();

    return NextResponse.json(parts, { status: 200 });
  } catch (error) {
    console.error("Data retrieval error:", error);
    return NextResponse.json({ error: "Failed to retrieve data" }, { status: 500 });
  }
}