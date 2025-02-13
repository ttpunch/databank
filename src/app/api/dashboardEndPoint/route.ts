import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db'; // Adjust the import based on your project structure
import Machine from '@/app/modelNew/Machine'; // Adjust the import based on your project structure
import OEM from '@/app/modelNew/OEM'; // Adjust the import based on your project structure
import Part from '@/app/modelNew/Part'; // Adjust the import based on your project structure

export async function GET() {
    await connectToDatabase(); // Ensure you are connected to the database

    try {
        // Area-wise Installed Machines
        const pipeline1:any = [
            {
                $lookup: {
                    from: Machine.collection.name,
                    localField: 'machine',
                    foreignField: '_id',
                    as: 'machineDetails',
                },
            },
            {
                $unwind: '$machineDetails' // Unwind to access fields from machineDetails
            },
            {
                $group: {
                    _id: '$machineDetails.area', // Group by machine area
                    totalMachines: { $addToSet: "$machineDetails._id" } // Collect unique machine IDs
                }
            },
            {
                $project: {
                    _id: 0,
                    area: "$_id",
                    totalMachines: { $size: "$totalMachines" } // Count unique machines
                }
            },
            { $sort: { totalMachines: -1 } }
        ];

        const areaWiseMachines = await Machine.aggregate(pipeline1);
        console.log("Area-wise Machines:", areaWiseMachines); // Log the results

        // Machine-wise OEM
        const pipeline2:any = [
            {
                $lookup: {
                    from: OEM.collection.name,
                    localField: 'OEM',
                    foreignField: '_id',
                    as: 'oemDetails',
                },
            },
            {
                $unwind: '$oemDetails' // Unwind to access fields from oemDetails
            },
            {
                $group: {
                    _id: "$machineDetails.name",
                    associatedOEMs: { $addToSet: "$oemDetails.name" } // Collect OEMs per machine
                }
            },
            {
                $project: {
                    _id: 0,
                    machineName: "$_id",
                    oems: "$associatedOEMs"
                }
            },
            { $sort: { machineName: 1 } }
        ];

        const machineWiseOEMs = await Machine.aggregate(pipeline2);
        console.log("Machine-wise OEMs:", machineWiseOEMs); // Log the results

        // OEM-wise Parts
        const pipeline3:any = [
            {
                $lookup: {
                    from: Part.collection.name,
                    localField: '_id',
                    foreignField: 'OEM',
                    as: 'parts'
                }
            },
            {
                $unwind: '$parts'
            },
            {
                $group: {
                    _id: '$name',
                    parts: { $addToSet: '$parts.partNo' } // Collect parts per OEM
                }
            },
            {
                $project: {
                    _id: 0,
                    oemName: '$_id',
                    parts: 1
                }
            },
            { $sort: { oemName: 1 } }
        ];

        const oemWiseParts = await OEM.aggregate(pipeline3);
        console.log("OEM-wise Parts:", oemWiseParts); // Log the results

        // Part-wise Installed Quantity
        const pipeline4:any = [
            {
                $group: {
                    _id: "$partNo",
                    totalInstalled: { $sum: "$installedQuantity" } // Sum installed quantity
                }
            },
            {
                $project: {
                    _id: 0,
                    partNo: "$_id",
                    totalInstalled: 1
                }
            },
            { $sort: { totalInstalled: -1 } }
        ];

        const partWiseInstalledQuantity = await Part.aggregate(pipeline4);
        console.log("Part-wise Installed Quantity:", partWiseInstalledQuantity); // Log the results

        return NextResponse.json({ areaWiseMachines, machineWiseOEMs, oemWiseParts, partWiseInstalledQuantity });
    } catch (error) {
        console.error("Error retrieving data:", error);
        return NextResponse.json({ error: "Error retrieving data" }, { status: 500 });
    }
}