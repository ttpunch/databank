import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/db";
import Area from "@/app/models/Area";
import OEM from "@/app/models/Oem";
import Machine from "@/app/models/Machine";
import Part from "@/app/models/Part";
import User from "@/app/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession({ req: request, ...authOptions });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { areas, oems, machines, parts } = await request.json();
    const userEmail = session.user.email;

    // Find the user from the session
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Insert Areas and assign users
    const areasWithOwnerIds = areas.map(area => ({
      ...area,
      owner: user._id
    }));
    const insertedAreas = await Area.insertMany(areasWithOwnerIds);
    const areaMap = Object.fromEntries(insertedAreas.map(area => [area.name, area._id]));

    // Insert OEMs
    const insertedOEMs = await OEM.insertMany(oems);
    const oemMap = Object.fromEntries(insertedOEMs.map(oem => [oem.name, oem._id]));

    // Insert Machines and link to Areas & OEMs
    const machinesWithRefs = machines.map(machine => ({
      ...machine,
      area: areaMap[machine.area] || null,
      oem: oemMap[machine.oem] || null
    }));
    const insertedMachines = await Machine.insertMany(machinesWithRefs);
    const machineMap = Object.fromEntries(insertedMachines.map(machine => [machine.name, machine._id]));

    // Insert Parts and link to Machines
    const partsWithRefs = parts.map(part => ({
      ...part,
      machine: machineMap[part.machine] || null
    }));
    await Part.insertMany(partsWithRefs);

    return NextResponse.json(
      { message: "Data inserted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Data insertion error:", error);
    return NextResponse.json(
      { error: "Failed to insert data" },
      { status: 500 }
    );
  }
}