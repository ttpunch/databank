import mongoose, { Schema, model, models } from "mongoose";

export interface IOEM {
  name: string;
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const oemSchema = new Schema<IOEM>(
  {
    name: { type: String, required: true, unique: true }, // Manufacturer name (e.g., Siemens, Fanuc)
    },
  { timestamps: true }
);

const OEM = models?.OEM || model<IOEM>("OEM", oemSchema);

export default OEM;
