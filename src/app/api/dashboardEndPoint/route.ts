import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db';
import Machine from '@/app/modelNew/Machine';
import OEM from '@/app/modelNew/OEM';
import Part from '@/app/modelNew/Part';

export async function GET() {
    await connectToDatabase(); // Ensure DB connection

    try {
        // Area-wise Installed Machines
        const pipeline1: any[] = [
            {
                $lookup: {
                    from: "machines",
                    localField: "machine",
                    foreignField: "_id",
                    as: "machineDetails"
                }
            },
            {
                $unwind: {
                    path: "$machineDetails",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $group: {
                    _id: "$machineDetails.area",
                    totalMachines: { $addToSet: "$machineDetails._id" }
                }
            },
            {
                $lookup: {
                    from: "areas", // Assuming "areas" is your collection with area details
                    localField: "_id",
                    foreignField: "_id",
                    as: "areaDetails"
                }
            },
            {
                $unwind: {
                    path: "$areaDetails",
                    preserveNullAndEmptyArrays: true // Allow areas without names
                }
            },
            {
                $project: {
                    _id: 0,
                    areaId: "$_id",
                    areaName: { $ifNull: ["$areaDetails.name", "Unknown"] }, // Fallback to "Unknown" if no name is found
                    totalMachines: { $size: "$totalMachines" }
                }
            },
            { $sort: { totalMachines: -1 } }
        ];
        
        const areaWiseMachines = await Part.aggregate(pipeline1);
        
        

        // Machine-wise Part List
        const pipeline2: any[] = [
            {
                $lookup: {
                    from: "parts", // Correct collection name
                    localField: '_id',
                    foreignField: 'machine',
                    as: 'parts',
                },
            },
            {
                $unwind: "$parts"
            },
            {
                $group: {
                    _id: "$name",
                    parts: {
                        $push: {
                            partNo: "$parts.partNo",
                            partDetail: "$parts.partDetail",
                            installedQuantity: "$parts.installedQuantity",
                            availableQuantity: "$parts.availableQuantity"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    machineName: "$_id",
                    parts: 1
                }
            },
            { $sort: { machineName: 1 } }
        ];

        const machineWiseParts = await Machine.aggregate(pipeline2);

        // Part-wise Installed and Available Quantity
        const pipeline3: any[] = [
            {
                $group: {
                    _id: "$partNo",
                    totalInstalled: { $sum: "$installedQuantity" },
                    totalAvailable: { $sum: "$availableQuantity" }
                }
            },
            {
                $project: {
                    _id: 0,
                    partNo: "$_id",
                    totalInstalled: 1,
                    totalAvailable: 1
                }
            },
            { $sort: { totalInstalled: -1 } }
        ];

        const partWiseQuantities = await Part.aggregate(pipeline3);

        
            
        
        const pipelineDebug: any = [
            {
                $lookup: {
                    from: "machines",  // Ensure the correct collection name
                    localField: "machine",
                    foreignField: "_id",
                    as: "machineDetails"
                }
            },
            { $unwind: { path: "$machineDetails", preserveNullAndEmptyArrays: true } },
        
            {
                $lookup: {
                    from: "oems",
                    localField: "OEM",
                    foreignField: "_id",
                    as: "oemDetails"
                }
            },
            { $unwind: { path: "$oemDetails", preserveNullAndEmptyArrays: true } },
        
            // Lookup to get area name from areas collection
            {
                $lookup: {
                    from: "areas",  // Ensure the correct collection name
                    localField: "machineDetails.area",
                    foreignField: "_id",
                    as: "areaDetails"
                }
            },
            { $unwind: { path: "$areaDetails", preserveNullAndEmptyArrays: true } },
        
            {
                $project: {
                    _id: 1,
                    installedQuantity: 1,
                    "machineDetails.area": 1,
                    "machineDetails.name": 1, // ✅ Added machine name
                    "oemDetails.name": 1,
                    "areaDetails.name": 1 // ✅ Added area name
                }
            }
        ];
        
        
        const debugData = await Part.aggregate(pipelineDebug);
        console.log("Debug Data After Lookup:", debugData);
        
        
        const areaWiseOEMs = debugData.reduce((acc, item) => {
            const { installedQuantity, machineDetails, oemDetails, areaDetails } = item;
            if (!machineDetails || !oemDetails || !areaDetails) return acc; // Skip if missing data
        
            const area = machineDetails.area;
            const areaName = areaDetails.name; // ✅ Use areaName instead of just ID
            const oemName = oemDetails.name;
        
            // Check if area exists in accumulator
            let areaEntry = acc.find((a: { area: string; }) => a.area === area);
            if (!areaEntry) {
                areaEntry = { area, areaName, OEMs: [] }; // ✅ Include areaName
                acc.push(areaEntry);
            }
        
            // Check if OEM exists in the area
            let oemEntry = areaEntry.OEMs.find((o: { name: string; }) => o.name === oemName);
            if (!oemEntry) {
                oemEntry = { name: oemName, totalInstalledQuantity: 0 };
                areaEntry.OEMs.push(oemEntry);
            }
        
            // Accumulate installed quantity
            oemEntry.totalInstalledQuantity += installedQuantity;
        
            return acc;
        }, []);
        
        
        console.log("areaWiseOEMs:", areaWiseOEMs);
        


        return NextResponse.json({
            areaWiseMachines,
            machineWiseParts,
            partWiseQuantities,
            areaWiseOEMs,
            debugData
        });

    } catch (error) {
        console.error("Error retrieving data:", error);
        return NextResponse.json({ error: "Error retrieving data" }, { status: 500 });
    }
}
