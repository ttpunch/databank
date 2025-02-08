import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  area?: mongoose.Types.ObjectId; // Only one area for regular users
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user"
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      required: function () {
        return this.role === "user"; // Area is required for regular users
      }
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Virtual getter to check if user is an admin
userSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
});

const User = models?.User || model<IUser>("User", userSchema);

export default User;
