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
      },
      validate: {
        validator: async function(areaId: mongoose.Types.ObjectId) {
          try {
            const Area = mongoose.model('Area');
            const area = await Area.findById(areaId);
            return area !== null;
          } catch (error) {
            return false;
          }
        },
        message: 'Invalid area ID or area does not exist'
      }
    }
  },
  { timestamps: true }
);

// Modify the pre-save middleware to check if password was already hashed
userSchema.pre("save", async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Check if password is already hashed
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      return next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error as Error);
  }
});

// Virtual getter to check if user is an admin
userSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
});

const User = models?.User || model<IUser>("User", userSchema);

export default User;
