import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { name } = await req.json();
    return NextResponse.json({ message: `Hello ${name}` });
}
export async function GET() {
    return NextResponse.json({ message: 'Hello World' });
}