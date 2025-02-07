import mongoose, { Schema, model, models } from "mongoose";

export interface IMachine {
  name: string;
  machine_no: string;
  area: mongoose.Types.ObjectId;
  oem: mongoose.Types.ObjectId;
  parts: mongoose.Types.ObjectId[];
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const machineSchema = new Schema<IMachine>(
  {
    name: { type: String, required: true },
    machine_no:{type:String,required:true}, // Machine name (e.g., CNC Milling Machine)
    area: { type: mongoose.Schema.Types.ObjectId, ref: "Area", required: true }, // Machine belongs to an Area
    oem: { type: mongoose.Schema.Types.ObjectId, ref: "OEM", required: true }, // OEM (manufacturer) of the machine
    parts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Part" }], // Parts installed in the machine
  },
  { timestamps: true }
);

const Machine = models?.Machine || model<IMachine>("Machine", machineSchema);

export default Machine;
