import mongoose, { Schema, model, models } from "mongoose";

export interface IMachine {
  name: string;
  machineNo: string;
  area: mongoose.Types.ObjectId; // Machine belongs to an Area
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const machineSchema = new Schema<IMachine>(
  {
    name: { type: String, required: true },
    machineNo: { type: String, required: true, unique: true },
    area: { type: mongoose.Schema.Types.ObjectId, ref: "Area", required: true }
  },
  { timestamps: true }
);

const Machine = models?.Machine || model<IMachine>("Machine", machineSchema);
export default Machine;
