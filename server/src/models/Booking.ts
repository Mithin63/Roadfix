import mongoose, { Schema } from 'mongoose';
import { BreakdownProblem, BookingStatus } from '../types';

export interface IBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  mechanicId: string;
  mechanicName?: string;
  mechanicPhone?: string;
  mechanicAvatar?: string;
  vehicleId: string;
  vehicleInfo: {
    type: string;
    make: string;
    model: string;
    regNo: string;
    fuelType: string;
  };
  problemType: BreakdownProblem;
  problemDescription: string;
  customerLat: number;
  customerLng: number;
  customerAddress: string;
  mechanicLat?: number;
  mechanicLng?: number;
  status: BookingStatus;
  timeline: Array<{
    status: BookingStatus;
    timestamp: string;
    note?: string;
  }>;
  etaMinutes: number;
  distanceKm: number;
  pricing: {
    baseService: number;
    travelCharge: number;
    labour: number;
    parts: number;
    additionalCharges: number;
    total: number;
    isFinal: boolean;
  };
  spareParts: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  additionalCharges: Array<{
    id: string;
    description: string;
    amount: number;
    approvedByCustomer: boolean;
    requestedAt: string;
  }>;
  mediaUrls: string[];
  aiDiagnosis?: any;
  workPerformed?: string;
  mechanicDiagnosisNotes?: string;
  createdAt: string;
  completedAt?: string;
}

const BookingSchema = new Schema<IBooking>(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    mechanicId: { type: String, required: true, index: true },
    mechanicName: { type: String },
    mechanicPhone: { type: String },
    mechanicAvatar: { type: String },
    vehicleId: { type: String, required: true },
    vehicleInfo: {
      type: { type: String, default: 'car' },
      make: { type: String, default: 'Hyundai' },
      model: { type: String, default: 'Creta' },
      regNo: { type: String, default: 'MH 02 EQ 8821' },
      fuelType: { type: String, default: 'petrol' }
    },
    problemType: { type: String, required: true },
    problemDescription: { type: String, required: true },
    customerLat: { type: Number, required: true },
    customerLng: { type: Number, required: true },
    customerAddress: { type: String, required: true },
    mechanicLat: { type: Number },
    mechanicLng: { type: Number },
    status: {
      type: String,
      enum: [
        'requested',
        'accepted',
        'preparing_equipment',
        'travelling',
        'arrived',
        'diagnosis_started',
        'repair_in_progress',
        'repair_completed',
        'payment_completed',
        'cancelled'
      ],
      default: 'requested'
    },
    timeline: [
      {
        status: { type: String },
        timestamp: { type: String },
        note: { type: String }
      }
    ],
    etaMinutes: { type: Number, default: 15 },
    distanceKm: { type: Number, default: 3.5 },
    pricing: {
      baseService: { type: Number, default: 299 },
      travelCharge: { type: Number, default: 150 },
      labour: { type: Number, default: 350 },
      parts: { type: Number, default: 0 },
      additionalCharges: { type: Number, default: 0 },
      total: { type: Number, default: 799 },
      isFinal: { type: Boolean, default: false }
    },
    spareParts: [
      {
        name: { type: String },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 }
      }
    ],
    additionalCharges: [
      {
        id: { type: String },
        description: { type: String },
        amount: { type: Number },
        approvedByCustomer: { type: Boolean, default: false },
        requestedAt: { type: String }
      }
    ],
    mediaUrls: [{ type: String }],
    aiDiagnosis: { type: Schema.Types.Mixed },
    workPerformed: { type: String },
    mechanicDiagnosisNotes: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
    completedAt: { type: String }
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

export const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema);
