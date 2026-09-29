import mongoose, { Schema, Document } from 'mongoose';

// 1. Review Model
export interface IReviewDocument extends Document {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  mechanicId: string;
  overallRating: number;
  speedRating: number;
  professionalismRating: number;
  fairPriceRating: number;
  comment: string;
  createdAt: string;
}

const ReviewSchema = new Schema<IReviewDocument>({
  id: { type: String, required: true, unique: true, index: true },
  bookingId: { type: String, required: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerAvatar: { type: String },
  mechanicId: { type: String, required: true, index: true },
  overallRating: { type: Number, required: true },
  speedRating: { type: Number, default: 5 },
  professionalismRating: { type: Number, default: 5 },
  fairPriceRating: { type: Number, default: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export const ReviewModel = mongoose.model<IReviewDocument>('Review', ReviewSchema);

// 2. Notification Model
export interface INotificationDocument extends Document {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  bookingId?: string;
  read: boolean;
  createdAt: string;
}

const NotificationSchema = new Schema<INotificationDocument>({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'danger'], default: 'info' },
  bookingId: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export const NotificationModel = mongoose.model<INotificationDocument>('Notification', NotificationSchema);

// 3. ChatMessage Model
export interface IChatMessageDocument extends Document {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: 'customer' | 'mechanic' | 'system';
  text: string;
  timestamp: string;
}

const ChatMessageSchema = new Schema<IChatMessageDocument>({
  id: { type: String, required: true, unique: true, index: true },
  bookingId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderRole: { type: String, enum: ['customer', 'mechanic', 'system'], required: true },
  text: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export const ChatMessageModel = mongoose.model<IChatMessageDocument>('ChatMessage', ChatMessageSchema);

// 4. Complaint Model
export interface IComplaintDocument extends Document {
  id: string;
  customerId: string;
  customerName: string;
  mechanicId: string;
  mechanicName: string;
  bookingId: string;
  issueType: 'overcharging' | 'delay' | 'bad_behaviour' | 'poor_repair' | 'other';
  description: string;
  status: 'pending' | 'under_investigation' | 'resolved' | 'refunded' | 'rejected';
  resolutionNote?: string;
  createdAt: string;
}

const ComplaintSchema = new Schema<IComplaintDocument>({
  id: { type: String, required: true, unique: true, index: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  mechanicId: { type: String, required: true },
  mechanicName: { type: String, required: true },
  bookingId: { type: String, required: true },
  issueType: { type: String, enum: ['overcharging', 'delay', 'bad_behaviour', 'poor_repair', 'other'], required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'under_investigation', 'resolved', 'refunded', 'rejected'], default: 'pending' },
  resolutionNote: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export const ComplaintModel = mongoose.model<IComplaintDocument>('Complaint', ComplaintSchema);

// 5. MaintenanceRecord Model
export interface IMaintenanceRecordDocument extends Document {
  id: string;
  customerId: string;
  vehicleId: string;
  vehicleName: string;
  lastServiceDate: string;
  odometerKm: number;
  nextDueKm: number;
  isDueSoon: boolean;
  notes: string;
}

const MaintenanceRecordSchema = new Schema<IMaintenanceRecordDocument>({
  id: { type: String, required: true, unique: true, index: true },
  customerId: { type: String, required: true, index: true },
  vehicleId: { type: String, required: true },
  vehicleName: { type: String, required: true },
  lastServiceDate: { type: String, required: true },
  odometerKm: { type: Number, required: true },
  nextDueKm: { type: Number, required: true },
  isDueSoon: { type: Boolean, default: false },
  notes: { type: String, default: '' }
}, { timestamps: true });

export const MaintenanceRecordModel = mongoose.model<IMaintenanceRecordDocument>('MaintenanceRecord', MaintenanceRecordSchema);

// 6. EmergencyContact Model
export interface IEmergencyContactDocument extends Document {
  id: string;
  customerId: string;
  name: string;
  relationship: string;
  phone: string;
}

const EmergencyContactSchema = new Schema<IEmergencyContactDocument>({
  id: { type: String, required: true, unique: true, index: true },
  customerId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phone: { type: String, required: true }
}, { timestamps: true });

export const EmergencyContactModel = mongoose.model<IEmergencyContactDocument>('EmergencyContact', EmergencyContactSchema);

// 7. Invoice Model
export interface IInvoiceDocument extends Document {
  invoiceNumber: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  mechanicId: string;
  mechanicName: string;
  mechanicWorkshop: string;
  vehicleInfo: string;
  serviceDate: string;
  breakdownSummary: string;
  items: Array<{ description: string; amount: number }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid';
  paidAt?: string;
}

const InvoiceSchema = new Schema<IInvoiceDocument>({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  bookingId: { type: String, required: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  mechanicId: { type: String, required: true },
  mechanicName: { type: String, required: true },
  mechanicWorkshop: { type: String, default: 'Roadfix Mobile Care' },
  vehicleInfo: { type: String, required: true },
  serviceDate: { type: String, required: true },
  breakdownSummary: { type: String, required: true },
  items: [
    {
      description: { type: String, required: true },
      amount: { type: Number, required: true }
    }
  ],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'UPI' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'paid' },
  paidAt: { type: String }
}, { timestamps: true });

export const InvoiceModel = mongoose.model<IInvoiceDocument>('Invoice', InvoiceSchema);

// 8. Payment Model
export interface IPaymentDocument extends Document {
  id: string;
  bookingId: string;
  amount: number;
  method: 'upi' | 'card' | 'cash' | 'wallet';
  status: 'success' | 'failed' | 'pending';
  transactionRef: string;
  paidAt: string;
}

const PaymentSchema = new Schema<IPaymentDocument>({
  id: { type: String, required: true, unique: true, index: true },
  bookingId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['upi', 'card', 'cash', 'wallet'], default: 'upi' },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
  transactionRef: { type: String, required: true },
  paidAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export const PaymentModel = mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
