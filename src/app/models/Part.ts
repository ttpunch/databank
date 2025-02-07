import mongoose, { Schema, model, models } from "mongoose";

export interface IPart {
  name: string;
  machine: mongoose.Types.ObjectId;
  installedQuantity: number;
  availableQuantity: number;
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const partSchema = new Schema<IPart>(
  {
    name: { type: String, required: true }, // Part name (e.g., "Servo Motor", "Spindle Bearing")
    machine: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true }, // Part belongs to which machine
    installedQuantity: { type: Number, required: true }, // Quantity installed in the machine
    availableQuantity: { type: Number, required: true }, // Quantity available in inventory
  },
  { timestamps: true }
);

const Part = models?.Part || model<IPart>("Part", partSchema);

export default Part;
