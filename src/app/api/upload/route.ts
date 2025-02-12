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
import { EventEmitter } from 'events';

// Create a global event emitter for progress updates
const progressEmitter = new EventEmitter();

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

// Progress tracking endpoint
export async function GET(request: NextRequest) {
  const uploadId = request.nextUrl.searchParams.get('uploadId');
  
  if (!uploadId) {
    return NextResponse.json({ error: "Upload ID required" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const sendProgress = (progress: any) => {
        const data = encoder.encode(`data: ${JSON.stringify(progress)}\n\n`);
        controller.enqueue(data);
      };

      progressEmitter.on(`progress:${uploadId}`, sendProgress);
      request.signal.addEventListener('abort', () => {
        progressEmitter.removeListener(`progress:${uploadId}`, sendProgress);
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
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
  const uploadId = crypto.randomUUID();
  let currentBatch = 0;
  let totalBatches = 0;

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
    totalBatches = Math.ceil(rawData.length / BATCH_SIZE);

    // Emit initial progress
    progressEmitter.emit(`progress:${uploadId}`, {
      status: 'started',
      total: rawData.length,
      processed: 0,
      successful: 0,
      failed: 0,
      currentBatch: 0,
      totalBatches,
      percentage: 0
    });

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as any[],
      processedParts: [] as any[]
    };

    // Process in batches
    for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
      currentBatch++;
      const batch = rawData.slice(i, i + BATCH_SIZE);
      const batchStartTime = Date.now();
      
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
          results.errors.push({
            row: i + rowIndex + 2,
            error: error.message,
            data: row
          });
        }
      });

      await Promise.all(batchPromises);

      // Calculate and emit progress
      const processed = Math.min(i + BATCH_SIZE, rawData.length);
      const percentage = Math.round((processed / rawData.length) * 100);
      const batchProcessingTime = Date.now() - batchStartTime;
      
      progressEmitter.emit(`progress:${uploadId}`, {
        status: 'processing',
        total: rawData.length,
        processed,
        successful: results.successful,
        failed: results.failed,
        currentBatch,
        totalBatches,
        percentage,
        batchProcessingTime,
        estimatedTimeRemaining: 
          Math.round(batchProcessingTime * (totalBatches - currentBatch) / 1000)
      });
    }

    // Emit completion status
    progressEmitter.emit(`progress:${uploadId}`, {
      status: 'completed',
      total: rawData.length,
      processed: rawData.length,
      successful: results.successful,
      failed: results.failed,
      currentBatch,
      totalBatches,
      percentage: 100
    });

    return NextResponse.json({
      message: "File processing completed",
      uploadId,
      summary: {
        totalRows: rawData.length,
        successfullyProcessed: results.successful,
        failed: results.failed,
        errors: results.errors
      },
      processedParts: results.processedParts
    }, { status: results.failed > 0 ? 207 : 200 });

  } catch (error) {
    progressEmitter.emit(`progress:${uploadId}`, {
      status: 'error',
      error: error.message,
      currentBatch,
      totalBatches
    });

    console.error("File upload error:", error);
    return NextResponse.json({
      error: "Failed to process file",
      details: error.message
    }, { status: 500 });
  }
}

