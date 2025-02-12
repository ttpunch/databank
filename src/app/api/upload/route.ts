import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/db";
import Area from "@/app/modelNew/Area";
import Machine from "@/app/modelNew/Machine";
import OEM from "@/app/modelNew/OEM";
import Part from "@/app/modelNew/Part";
import User from "@/app/modelNew/User";
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { parse as csvParse } from 'csv-parse/sync';

// Schema matching your existing database structure
const RowSchema = z.object({
  area: z.string().min(1, "Area is required"),
  machine: z.string().min(1, "Machine is required"),
  machineNo: z.string().min(1, "Machine number is required"),
  oem: z.string().min(1, "OEM is required"),
  partNo: z.string().min(1, "Part number is required"),
  partDetail: z.string().min(1, "Part detail is required"),
  installedQuantity: z.number().min(0, "Installed quantity must be non-negative"),
  availableQuantity: z.number().min(0, "Available quantity must be non-negative")
});

const BATCH_SIZE = 50;
const ALLOWED_FILE_TYPES = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'text/csv': 'csv',
  'application/csv': 'csv'
};

export async function GET(request: NextRequest) {
  const uploadId = request.nextUrl.searchParams.get('uploadId');
  
  if (!uploadId) {
    return NextResponse.json({ error: "Upload ID required" }, { status: 400 });
  }

  // The GET function logic without progress tracking
  return NextResponse.json({ message: "Progress tracking removed" }, { status: 200 });
}

async function parseFileContent(file: File): Promise<any[]> {
  const buffer = await file.arrayBuffer();
  const fileType = ALLOWED_FILE_TYPES[file.type];

  if (fileType === 'csv') {
    const text = new TextDecoder().decode(buffer);
    return csvParse(text, {
      columns: true,
      skip_empty_lines: true,
      cast: true
    });
  } else {
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(worksheet);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES[file.type]) {
      return NextResponse.json({
        error: "Invalid file type",
        allowedTypes: Object.keys(ALLOWED_FILE_TYPES)
      }, { status: 400 });
    }

    await connectToDatabase();
    const rawData = await parseFileContent(file);
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as any[],
      processedParts: [] as any[]
    };

    // Process in batches
    for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
      const batch = rawData.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (row, rowIndex) => {
        try {
          // Validate row data
          const validatedRow = await RowSchema.parseAsync({
            ...row,
            installedQuantity: Number(row.installedQuantity),
            availableQuantity: Number(row.availableQuantity)
          });

          // Using your existing database logic
          let areaDoc = await Area.findOne({ name: validatedRow.area });
          if (!areaDoc) {
            areaDoc = await Area.create({ name: validatedRow.area });
          }

          let machineDoc = await Machine.findOne({
            name: validatedRow.machine,
            machineNo: validatedRow.machineNo,
            area: areaDoc._id
          });
          if (!machineDoc) {
            machineDoc = await Machine.create({
              name: validatedRow.machine,
              machineNo: validatedRow.machineNo,
              area: areaDoc._id
            });
          }

          let oemDoc = await OEM.findOne({ name: validatedRow.oem });
          if (!oemDoc) {
            oemDoc = await OEM.create({ name: validatedRow.oem });
          }

          const part = await Part.create({
            machine: machineDoc._id,
            OEM: oemDoc._id,
            partNo: validatedRow.partNo,
            partDetail: validatedRow.partDetail,
            installedQuantity: validatedRow.installedQuantity,
            availableQuantity: validatedRow.availableQuantity
          });

          results.successful++;
          results.processedParts.push(part);

        } catch (error) {
          results.failed++;
          if (error instanceof Error) {
            results.errors.push({
              row: i + rowIndex + 2,
              error: error.message,
              data: row
            });
          } else {
            results.errors.push({
              row: i + rowIndex + 2,
              error: 'An unknown error occurred',
              data: row
            });
          }
        }
      });

      await Promise.all(batchPromises);
    }

    return NextResponse.json({
      message: "File processing completed",
      summary: {
        totalRows: rawData.length,
        successfullyProcessed: results.successful,
        failed: results.failed,
        errors: results.errors
      },
      processedParts: results.processedParts
    }, { status: results.failed > 0 ? 207 : 200 });

  } catch (error) {
    if (error instanceof Error) {
      console.error("File upload error:", error);
      return NextResponse.json({
        error: "Failed to process file",
        details: error.message
      }, { status: 500 });
    } else {
      console.error("File upload error: An unknown error occurred");
      return NextResponse.json({
        error: "Failed to process file",
        details: "An unknown error occurred"
      }, { status: 500 });
    }
  }
}

// Removed handleError function as it is no longer needed