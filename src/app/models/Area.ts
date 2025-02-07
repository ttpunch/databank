import mongoose, { Schema, model, models } from "mongoose";

export interface IArea {
  name: string;
  description?: string;
  machines: mongoose.Types.ObjectId[];
  owner: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const areaSchema = new Schema<IArea>(
  {
    name: { type: String, required: true, unique: true }, // Area name (e.g., CNC-LAB)
    description: { type: String }, // Optional description
    machines: [{ type: mongoose.Schema.Types.ObjectId, ref: "Machine" }], // Machines in this area
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Owner of the area
  },
  { timestamps: true }
);

const Area = models?.Area || model<IArea>("Area", areaSchema);

export default Area;
