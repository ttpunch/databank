import mongoose, { Schema, model, models } from "mongoose";

export interface IArea {
  name: string;
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const areaSchema = new Schema<IArea>(
  {
    name: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

const Area = models?.Area || model<IArea>("Area", areaSchema);
export default Area;
