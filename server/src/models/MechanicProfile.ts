import mongoose, { Schema } from 'mongoose';

export interface IMechanicProfile {
  userId: string;
  workshopName: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  verificationDocs: {
    idProof: string;
    drivingLicense: string;
    workshopReg?: string;
    status: 'pending' | 'verified' | 'rejected';
  };
  skills: string[];
  supportedVehicleTypes: string[];
  equipment: string[];
  isOnline: boolean;
  serviceRadiusKm: number;
  hourlyRate: number;
  baseServiceFee: number;
  currentLat: number;
  currentLng: number;
  totalRepairs: number;
  todayEarnings: number;
  totalEarnings: number;
  address: string;
}

const MechanicProfileSchema = new Schema<IMechanicProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    workshopName: { type: String, required: true },
    experienceYears: { type: Number, default: 3 },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: true },
    verificationDocs: {
      idProof: { type: String, default: 'Aadhaar-Verified.pdf' },
      drivingLicense: { type: String, default: 'DL-Commercial-Verified.pdf' },
      workshopReg: { type: String, default: '' },
      status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'verified' }
    },
    skills: [{ type: String }],
    supportedVehicleTypes: [{ type: String }],
    equipment: [{ type: String }],
    isOnline: { type: Boolean, default: true },
    serviceRadiusKm: { type: Number, default: 15 },
    hourlyRate: { type: Number, default: 350 },
    baseServiceFee: { type: Number, default: 150 },
    currentLat: { type: Number, default: 19.0760 },
    currentLng: { type: Number, default: 72.8777 },
    totalRepairs: { type: Number, default: 0 },
    todayEarnings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    address: { type: String, default: 'Mumbai, Maharashtra' }
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

export const MechanicProfileModel = mongoose.model<IMechanicProfile>(
  'MechanicProfile',
  MechanicProfileSchema
);
