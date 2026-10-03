import { Router, Request, Response } from 'express';
import { db, calculateDistanceKm } from '../services/db';
import { Booking, BookingStatus, SparePart, AdditionalCharge, BreakdownProblem } from '../types';

const router = Router();

// Get bookings
router.get('/', (req: Request, res: Response) => {
  const { customerId, mechanicId, status } = req.query;

  let bookings = db.getAllBookings();

  if (customerId) {
    bookings = bookings.filter(b => b.customerId === customerId);
  }
  if (mechanicId) {
    bookings = bookings.filter(b => b.mechanicId === mechanicId);
  }
  if (status) {
    bookings = bookings.filter(b => b.status === status);
  }

  res.json({ success: true, bookings });
});

// Get single booking
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = db.getBooking(id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const chat = db.getChatMessages(id);
  const invoice = db.getInvoiceByBookingId(id);

  res.json({ success: true, booking, chat, invoice });
});

// Create new booking
let bookingCounter = 130;
router.post('/', (req: Request, res: Response) => {
  const {
    customerId,
    mechanicId,
    vehicleId,
    problemType,
    problemTypes,
    problemDescription,
    voiceNoteUrl,
    mediaUrls,
    customerLat,
    customerLng,
    customerAddress,
    aiDiagnosis
  } = req.body;

  if (!customerId || !mechanicId || !vehicleId || (!problemType && (!problemTypes || problemTypes.length === 0)) || !customerLat || !customerLng) {
    return res.status(400).json({ success: false, message: 'Missing required booking information' });
  }

  const resolvedProblemType = (problemType || (problemTypes && problemTypes[0]) || 'other') as BreakdownProblem;
  const resolvedProblemTypes = Array.isArray(problemTypes) ? problemTypes : [resolvedProblemType];

  const customer = db.getUser(customerId);
  const mechanic = db.getUser(mechanicId);
  const mechanicProfile = db.getMechanicProfile(mechanicId);
  const vehicle = db.getVehicle(vehicleId);

  if (!customer || !mechanic || !vehicle) {
    return res.status(404).json({ success: false, message: 'Customer, mechanic or vehicle record not found' });
  }

  bookingCounter++;
  const bookingId = `RR-2026-${String(bookingCounter).padStart(5, '0')}`;

  let mechLat = mechanicProfile?.currentLat || Number(customerLat);
  let mechLng = mechanicProfile?.currentLng || Number(customerLng);
  let distance = calculateDistanceKm(
    Number(customerLat),
    Number(customerLng),
    mechLat,
    mechLng
  );

  if (distance > 25) {
    // Position mechanic 1.8km away from customer GPS for live telemetry
    const angle = 0.8;
    const localDist = 1.8;
    mechLat = Number(customerLat) + (localDist / 111) * Math.cos(angle);
    mechLng = Number(customerLng) + (localDist / (111 * Math.cos((Number(customerLat) * Math.PI) / 180))) * Math.sin(angle);
    distance = localDist;
  }

  const etaMinutes = Math.max(5, Math.round((distance / 22) * 60) + 5);

  const baseService = mechanicProfile?.baseServiceFee || 150;
  const travelCharge = Math.round(distance * 25);
  const labourEst = aiDiagnosis?.estimatedCost?.labour || 250;
  const partsEst = aiDiagnosis?.estimatedCost?.parts || 0;
  const total = baseService + travelCharge + labourEst + partsEst;

  const newBooking: Booking = {
    id: bookingId,
    customerId,
    customerName: customer.name,
    customerPhone: customer.phone,
    mechanicId,
    mechanicName: mechanic.name,
    mechanicPhone: mechanic.phone,
    mechanicAvatar: mechanic.avatar,
    vehicleId,
    vehicleInfo: {
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      regNo: vehicle.regNo,
      fuelType: vehicle.fuelType
    },
    problemType: resolvedProblemType,
    problemTypes: resolvedProblemTypes,
    problemDescription: problemDescription || 'Roadside breakdown assistance requested',
    voiceNoteUrl,
    mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
    customerLat: Number(customerLat),
    customerLng: Number(customerLng),
    customerAddress: customerAddress || 'Roadside Location',
    mechanicLat: mechLat,
    mechanicLng: mechLng,
    status: 'requested',
    timeline: [
      {
        status: 'requested',
        timestamp: new Date().toISOString(),
        note: `Breakdown request logged. Equipment checklist dispatched to ${mechanic.name}.`
      }
    ],
    aiDiagnosis: aiDiagnosis || {
      id: `diag-${Date.now()}`,
      problemType,
      problemTitle: `${problemType.replace(/_/g, ' ').toUpperCase()}`,
      possibleCauses: ['Mechanical fatigue / electrical disruption'],
      severity: 'medium',
      recommendedService: 'Comprehensive On-Site Inspection',
      requiredEquipment: ['Standard Roadside Repair Kit'],
      estimatedCost: { baseService, travel: travelCharge, labour: labourEst, parts: partsEst, totalMin: total, totalMax: Math.round(total * 1.3) },
      estimatedTimeMinutes: 30,
      safeChecks: ['Ensure hazard warning lights are flashing.'],
      disclaimer: 'AI-generated assessment.'
    },
    spareParts: [],
    additionalCharges: [],
    pricing: {
      baseService,
      travelCharge,
      labour: labourEst,
      parts: partsEst,
      additionalCharges: 0,
      total,
      isFinal: false
    },
    etaMinutes,
    distanceKm: distance,
    createdAt: new Date().toISOString()
  };

  db.createBooking(newBooking);

  res.status(201).json({ success: true, booking: newBooking });
});

// Update booking status
router.patch('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  const updated = db.updateBookingStatus(id, status as BookingStatus, note);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  res.json({ success: true, booking: updated });
});

// Add spare part to booking
router.post('/:id/spare-parts', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, quantity, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Part name and price are required' });
  }

  const part: SparePart = {
    name,
    quantity: Number(quantity) || 1,
    price: Number(price)
  };

  const updated = db.addSparePartToBooking(id, part);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  res.json({ success: true, booking: updated });
});

// Request additional charge (requires customer approval)
router.post('/:id/additional-charge', (req: Request, res: Response) => {
  const { id } = req.params;
  const { description, amount } = req.body;

  if (!description || !amount) {
    return res.status(400).json({ success: false, message: 'Description and amount are required' });
  }

  const charge: AdditionalCharge = {
    id: `chg-${Date.now()}`,
    description,
    amount: Number(amount),
    approvedByCustomer: false,
    requestedAt: new Date().toISOString()
  };

  const updated = db.addAdditionalChargeToBooking(id, charge);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  res.json({ success: true, booking: updated, charge });
});

// Customer approves or rejects additional charge
router.post('/:id/approve-charge', (req: Request, res: Response) => {
  const { id } = req.params;
  const { chargeId, approved } = req.body;

  if (!chargeId || typeof approved !== 'boolean') {
    return res.status(400).json({ success: false, message: 'chargeId and approved boolean are required' });
  }

  const updated = db.approveAdditionalCharge(id, chargeId, approved);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Booking or charge not found' });
  }

  res.json({ success: true, booking: updated });
});

// Update pricing and notes
router.patch('/:id/pricing', (req: Request, res: Response) => {
  const { id } = req.params;
  const { baseService, travelCharge, labour, parts, workPerformed, mechanicDiagnosisNotes, isFinal } = req.body;

  const pricingUpdates: any = {};
  if (baseService !== undefined) pricingUpdates.baseService = Number(baseService);
  if (travelCharge !== undefined) pricingUpdates.travelCharge = Number(travelCharge);
  if (labour !== undefined) pricingUpdates.labour = Number(labour);
  if (parts !== undefined) pricingUpdates.parts = Number(parts);
  if (isFinal !== undefined) pricingUpdates.isFinal = Boolean(isFinal);

  const updated = db.updateBookingPricing(id, pricingUpdates, workPerformed, mechanicDiagnosisNotes);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  res.json({ success: true, booking: updated });
});

export default router;
