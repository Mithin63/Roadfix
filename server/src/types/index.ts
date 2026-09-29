export type UserRole = 'customer' | 'mechanic' | 'admin';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar: string;
  address?: string;
  lat: number;
  lng: number;
  createdAt: string;
  isBlocked: boolean;
}

export interface MechanicProfile {
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

export type VehicleCategory = 'bike' | 'scooter' | 'car' | 'suv' | 'auto' | 'van' | 'other';
export type FuelCategory = 'petrol' | 'diesel' | 'electric' | 'cng' | 'hybrid';

export interface Vehicle {
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

export type BreakdownProblem =
  | 'vehicle_wont_start'
  | 'flat_tyre'
  | 'battery_dead'
  | 'engine_problem'
  | 'brake_problem'
  | 'overheating'
  | 'fuel_problem'
  | 'electrical_problem'
  | 'accident_damage'
  | 'key_lock_problem'
  | 'other';

export interface AIDiagnosis {
  id: string;
  problemType: BreakdownProblem;
  problemTitle: string;
  possibleCauses: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendedService: string;
  requiredEquipment: string[];
  estimatedCost: {
    baseService: number;
    travel: number;
    labour: number;
    parts: number;
    totalMin: number;
    totalMax: number;
  };
  estimatedTimeMinutes: number;
  safeChecks: string[];
  safetyWarning?: string;
  disclaimer: string;
  imageAnalysisResult?: {
    identifiedDamage: string;
    confidence: number;
    tags: string[];
  };
}

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'preparing_equipment'
  | 'travelling'
  | 'arrived'
  | 'diagnosis_started'
  | 'repair_in_progress'
  | 'repair_completed'
  | 'payment_completed'
  | 'cancelled';

export interface SparePart {
  name: string;
  quantity: number;
  price: number;
}

export interface AdditionalCharge {
  id: string;
  description: string;
  amount: number;
  approvedByCustomer: boolean;
  requestedAt: string;
}

export interface BookingPricing {
  baseService: number;
  travelCharge: number;
  labour: number;
  parts: number;
  additionalCharges: number;
  total: number;
  isFinal: boolean;
}

export interface BookingTimelineItem {
  status: BookingStatus;
  timestamp: string;
  note?: string;
}

export interface Booking {
  id: string; // e.g. RR-2026-00125
  customerId: string;
  customerName: string;
  customerPhone: string;
  mechanicId: string;
  mechanicName?: string;
  mechanicPhone?: string;
  mechanicAvatar?: string;
  vehicleId: string;
  vehicleInfo: {
    type: VehicleCategory;
    make: string;
    model: string;
    regNo: string;
    fuelType: FuelCategory;
  };
  problemType: BreakdownProblem;
  problemDescription: string;
  voiceNoteUrl?: string;
  mediaUrls: string[];
  customerLat: number;
  customerLng: number;
  customerAddress: string;
  mechanicLat?: number;
  mechanicLng?: number;
  status: BookingStatus;
  timeline: BookingTimelineItem[];
  aiDiagnosis: AIDiagnosis;
  mechanicDiagnosisNotes?: string;
  workPerformed?: string;
  spareParts: SparePart[];
  additionalCharges: AdditionalCharge[];
  pricing: BookingPricing;
  etaMinutes: number;
  distanceKm: number;
  createdAt: string;
  completedAt?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  mechanicId: string;
  amount: number;
  method: 'upi' | 'card' | 'wallet' | 'cash';
  upiId?: string;
  cardLast4?: string;
  transactionRef: string;
  status: 'pending' | 'success' | 'failed';
  paidAt: string;
}

export interface Invoice {
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
  items: { description: string; amount: number }[];
  subtotal: number;
  tax: number; // 18% GST standard in India
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'unpaid';
  paidAt?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  mechanicId: string;
  overallRating: number; // 1 - 5
  responseTimeRating: number;
  professionalismRating: number;
  repairQualityRating: number;
  pricingTransparencyRating: number;
  comment: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  mechanicId: string;
  mechanicName: string;
  reason: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  resolutionNote?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'emergency';
  bookingId?: string;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: 'customer' | 'mechanic' | 'system';
  text: string;
  imageUrl?: string;
  timestamp: string;
}

export interface MaintenanceRecord {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceType: string;
  date: string;
  odometerKm: number;
  cost: number;
  notes: string;
  reminderMonths: number;
  nextDueKm?: number;
  nextDueDate?: string;
}

export interface EmergencyContact {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  relationship: string;
}
