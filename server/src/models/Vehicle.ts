import mongoose, { Schema } from 'mongoose';
import { VehicleCategory, FuelCategory } from '../types';

export interface IVehicle {
  id: string;
  customerId: string;
  type: VehicleCategory;
  make: string;
  model: string;
  year: number;
  regNo: string;
  fuelType: FuelCategory;
  color: string;
  lastServiceDate?: string;
  odometerKm?: number;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    type: { type: String, enum: ['bike', 'scooter', 'car', 'suv', 'auto', 'van', 'other'], default: 'car' },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, default: 2023 },
    regNo: { type: String, required: true, uppercase: true, trim: true },
    fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'cng', 'hybrid'], default: 'petrol' },
    color: { type: String, default: 'White' },
    lastServiceDate: { type: String },
    odometerKm: { type: Number, default: 15000 }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const VehicleModel = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
