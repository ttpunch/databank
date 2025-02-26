import mongoose, { Schema, model, models } from "mongoose";

export interface IArea {
  name: string;
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const areaSchema = new Schema<IArea>(
  {
    name: { 
      type: String, 
      required: [true, 'Area name is required'],
      unique: true, // This creates an index automatically
      trim: true,
      enum: {
        values: ['EM-FBM-DABG', 'TURBINE', 'NBS', 'CNCLAB'],
        message: '{VALUE} is not a valid area name'
      },
      uppercase: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for getting users in this area
areaSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'area'
});

// Pre-save middleware to ensure name is in correct format
areaSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.trim().toUpperCase();
  }
  next();
});

// Static method to get area by name
areaSchema.statics.findByName = function(name: string) {
  return this.findOne({ name: name.trim().toUpperCase() });
};

// Ensure model isn't recreated if it exists
const Area = models?.Area || model<IArea>("Area", areaSchema);

export default Area;
