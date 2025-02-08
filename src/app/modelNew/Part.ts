import mongoose, { Schema, model, models } from "mongoose";

export interface IPart {
  machine: mongoose.Types.ObjectId;
  OEM: mongoose.Types.ObjectId;
  partNo: string;
  partDetail?: string;
  installedQuantity: number;
  availableQuantity: number;
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const partSchema = new Schema<IPart>(
  {
    machine: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true },
    OEM: { type: mongoose.Schema.Types.ObjectId, ref: "OEM", required: true },
    partNo: { type: String, required: true, unique: true },
    partDetail: { type: String },
    installedQuantity: { type: Number, default: 0 },
    availableQuantity: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Part = models?.Part || model<IPart>("Part", partSchema);
export default Part;
