import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import User from "@/app/modelNew/User";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, areas } = await request.json();

    // 🔹 Basic Validations
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    // 🔹 Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // 🔹 Role Validation (Example roles: "admin", "user", "operator")
    const allowedRoles = ["admin", "user"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Allowed roles: ${allowedRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // 🔹 Password Strength Validation
    if (password.length < 5) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 🔹 Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // 🔹 Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Create New User
    const newUser = await User.create({
      name,
      email: email.toLowerCase(), // Normalize email storage
      password: hashedPassword,
      role,
      areas: Array.isArray(areas) ? areas : [], // Ensure areas is an array
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: newUser._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
