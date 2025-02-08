import mongoose, { Schema, model, models } from "mongoose";

export interface IOEM {
  name: string;
  description?: string;
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const oemSchema = new Schema<IOEM>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String }
  },
  { timestamps: true }
);

const OEM = models?.OEM || model<IOEM>("OEM", oemSchema);
export default OEM;
