import mongoose, { Schema, model, models } from "mongoose";

export interface IPartDetail {
  partId: mongoose.Types.ObjectId; // Reference to the Part model
  description: string; // Detailed description of the part
  createdAt?: Date;
  updatedAt?: Date;
}

const partDetailSchema = new Schema<IPartDetail>(
  {
    partId: { type: mongoose.Schema.Types.ObjectId, ref: "Part", required: true }, // Foreign key reference to Part
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const PartDetail = models?.PartDetail || model<IPartDetail>("PartDetail", partDetailSchema);

export default PartDetail;
