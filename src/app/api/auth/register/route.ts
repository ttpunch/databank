import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import User from "@/app/modelNew/User";
import Area from "@/app/modelNew/Area"; // Add this import
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, area } = await request.json();

    // 🔹 Basic Validations
    if (!name || !email || !password || !role || (role === "user" && !area)) {
      return NextResponse.json(
        { error: "Name, email, password, role, and area (for users) are required" },
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

    // 🔹 Validate and get Area if role is user
    let areaDoc;
    if (role === "user") {
      // Find area by name
      areaDoc = await Area.findOne({ name: area.trim().toUpperCase() });
      if (!areaDoc) {
        return NextResponse.json(
          { error: "Invalid area. Please select a valid area." },
          { status: 400 }
        );
      }
    }

    // 🔹 Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // 🔹 Create New User
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password, // Pass the plain password - model will hash it
      role,
      area: role === "user" ? areaDoc._id : undefined // Use the area document's ID
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
