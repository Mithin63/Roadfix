import fs from 'fs';
import path from 'path';
import {
  User,
  MechanicProfile,
  Vehicle,
  Booking,
  BookingStatus,
  Payment,
  Invoice,
  Review,
  Complaint,
  Notification,
  ChatMessage,
  MaintenanceRecord,
  EmergencyContact,
  SparePart,
  AdditionalCharge
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_MECHANIC_PROFILES,
  INITIAL_VEHICLES,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
  INITIAL_COMPLAINTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MAINTENANCE_RECORDS,
  INITIAL_EMERGENCY_CONTACTS
} from '../data/seeds';
import {
  UserModel,
  MechanicProfileModel,
  VehicleModel,
  BookingModel,
  ReviewModel,
  ComplaintModel,
  NotificationModel,
  ChatMessageModel,
  MaintenanceRecordModel,
  EmergencyContactModel,
  InvoiceModel,
  PaymentModel
} from '../models';

const DB_FILE_PATH = path.join(__dirname, '..', 'data', 'database_store.json');

// Haversine formula to compute great-circle distance between two coordinates in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

class DatabaseStore {
  public users: Map<string, User> = new Map();
  public mechanics: Map<string, MechanicProfile> = new Map();
  public vehicles: Map<string, Vehicle> = new Map();
  public bookings: Map<string, Booking> = new Map();
  public payments: Map<string, Payment> = new Map();
  public invoices: Map<string, Invoice> = new Map();
  public reviews: Map<string, Review> = new Map();
  public complaints: Map<string, Complaint> = new Map();
  public notifications: Map<string, Notification> = new Map();
  public chatMessages: Map<string, ChatMessage[]> = new Map(); // bookingId -> messages
  public maintenanceRecords: Map<string, MaintenanceRecord> = new Map();
  public emergencyContacts: Map<string, EmergencyContact> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const data = JSON.parse(raw);
        if (data.users) this.users = new Map(data.users);
        if (data.mechanics) this.mechanics = new Map(data.mechanics);
        if (data.vehicles) this.vehicles = new Map(data.vehicles);
        if (data.bookings) this.bookings = new Map(data.bookings);
        if (data.payments) this.payments = new Map(data.payments);
        if (data.invoices) this.invoices = new Map(data.invoices);
        if (data.reviews) this.reviews = new Map(data.reviews);
        if (data.complaints) this.complaints = new Map(data.complaints);
        if (data.notifications) this.notifications = new Map(data.notifications);
        if (data.chatMessages) this.chatMessages = new Map(data.chatMessages);
        if (data.maintenanceRecords) this.maintenanceRecords = new Map(data.maintenanceRecords);
        if (data.emergencyContacts) this.emergencyContacts = new Map(data.emergencyContacts);
        console.log(`[DatabaseStore] Loaded ${this.users.size} registered users from ${DB_FILE_PATH}`);
        return;
      } catch (err) {
        console.error('[DatabaseStore] Error loading database file, falling back to seed:', err);
      }
    }
    this.seed();
    this.saveToFile();
  }

  public saveToFile() {
    try {
      const data = {
        users: Array.from(this.users.entries()),
        mechanics: Array.from(this.mechanics.entries()),
        vehicles: Array.from(this.vehicles.entries()),
        bookings: Array.from(this.bookings.entries()),
        payments: Array.from(this.payments.entries()),
        invoices: Array.from(this.invoices.entries()),
        reviews: Array.from(this.reviews.entries()),
        complaints: Array.from(this.complaints.entries()),
        notifications: Array.from(this.notifications.entries()),
        chatMessages: Array.from(this.chatMessages.entries()),
        maintenanceRecords: Array.from(this.maintenanceRecords.entries()),
        emergencyContacts: Array.from(this.emergencyContacts.entries())
      };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DatabaseStore] Failed to save database to disk:', err);
    }
  }

  private seed() {
    INITIAL_USERS.forEach(u => this.users.set(u.id, { ...u, password: u.password || 'password123' }));
    INITIAL_MECHANIC_PROFILES.forEach(m => this.mechanics.set(m.userId, { ...m }));
    INITIAL_VEHICLES.forEach(v => this.vehicles.set(v.id, { ...v }));
    INITIAL_BOOKINGS.forEach(b => {
      this.bookings.set(b.id, { ...b });
      // Generate sample chat for active bookings
      if (b.status !== 'cancelled') {
        const msgs: ChatMessage[] = [
          {
            id: `msg-${b.id}-1`,
            bookingId: b.id,
            senderId: 'system',
            senderRole: 'system',
            text: `Booking ${b.id} created and dispatched to nearby certified mechanics.`,
            timestamp: b.createdAt
          },
          {
            id: `msg-${b.id}-2`,
            bookingId: b.id,
            senderId: b.mechanicId,
            senderRole: 'mechanic',
            text: `Hello ${b.customerName}, I have received your request and gathered the necessary equipment. Heading towards you now!`,
            timestamp: new Date(new Date(b.createdAt).getTime() + 120000).toISOString()
          }
        ];
        this.chatMessages.set(b.id, msgs);
      }

      // Generate invoice if completed
      if (b.status === 'payment_completed' || b.pricing.isFinal) {
        const inv: Invoice = {
          invoiceNumber: `INV-${b.id.replace('RR-', '')}`,
          bookingId: b.id,
          customerId: b.customerId,
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          mechanicId: b.mechanicId,
          mechanicName: b.mechanicName || 'Certified Mechanic',
          mechanicWorkshop: this.mechanics.get(b.mechanicId)?.workshopName || 'Roadfix Mobile Care',
          vehicleInfo: `${b.vehicleInfo.make} ${b.vehicleInfo.model} (${b.vehicleInfo.regNo})`,
          serviceDate: b.completedAt || b.createdAt,
          breakdownSummary: b.problemDescription,
          items: [
            { description: 'Emergency Roadside Inspection & Base Callout', amount: b.pricing.baseService },
            { description: `Travel & Dispatch Fee (${b.distanceKm} km)`, amount: b.pricing.travelCharge },
            { description: 'On-site Technical Labour', amount: b.pricing.labour },
            ...b.spareParts.map(p => ({ description: `${p.name} (Qty: ${p.quantity})`, amount: p.price * p.quantity })),
            ...b.additionalCharges.filter(c => c.approvedByCustomer).map(c => ({ description: c.description, amount: c.amount }))
          ],
          subtotal: b.pricing.total,
          tax: Math.round(b.pricing.total * 0.18),
          total: Math.round(b.pricing.total * 1.18),
          paymentMethod: 'UPI / Digital Payment',
          paymentStatus: 'paid',
          paidAt: b.completedAt || b.createdAt
        };
        this.invoices.set(inv.invoiceNumber, inv);
      }
    });

    INITIAL_REVIEWS.forEach(r => this.reviews.set(r.id, { ...r }));
    INITIAL_COMPLAINTS.forEach(c => this.complaints.set(c.id, { ...c }));
    INITIAL_NOTIFICATIONS.forEach(n => this.notifications.set(n.id, { ...n }));
    INITIAL_MAINTENANCE_RECORDS.forEach(m => this.maintenanceRecords.set(m.id, { ...m }));
    INITIAL_EMERGENCY_CONTACTS.forEach(ec => this.emergencyContacts.set(ec.id, { ...ec }));
  }

  // User operations
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  createUser(user: User): User {
    if (!user.password) user.password = 'password123';
    this.users.set(user.id, user);
    this.saveToFile();

    // Async sync with MongoDB if connected
    UserModel.findOneAndUpdate({ id: user.id }, user, { upsert: true, new: true }).catch(() => {});
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.users.set(id, updated);
    this.saveToFile();

    // Async sync with MongoDB if connected
    UserModel.findOneAndUpdate({ id }, updated, { upsert: true }).catch(() => {});
    return updated;
  }

  // Mechanic operations
  getMechanicProfile(userId: string): MechanicProfile | undefined {
    return this.mechanics.get(userId);
  }

  getAllMechanics(): (User & { profile: MechanicProfile })[] {
    const res: (User & { profile: MechanicProfile })[] = [];
    this.mechanics.forEach((profile, userId) => {
      const user = this.users.get(userId);
      if (user && !user.isBlocked) {
        res.push({ ...user, profile });
      }
    });
    return res;
  }

  updateMechanicProfile(userId: string, updates: Partial<MechanicProfile>): MechanicProfile | undefined {
    const existing = this.mechanics.get(userId);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.mechanics.set(userId, updated);
    this.saveToFile();

    // Async sync with MongoDB if connected
    MechanicProfileModel.findOneAndUpdate({ userId }, updated, { upsert: true }).catch(() => {});
    return updated;
  }

  // Vehicles
  getVehiclesByCustomer(customerId: string): Vehicle[] {
    return Array.from(this.vehicles.values()).filter(v => v.customerId === customerId);
  }

  getVehicle(id: string): Vehicle | undefined {
    return this.vehicles.get(id);
  }

  addVehicle(vehicle: Vehicle): Vehicle {
    this.vehicles.set(vehicle.id, vehicle);
    this.saveToFile();

    // Async sync with MongoDB if connected
    VehicleModel.findOneAndUpdate({ id: vehicle.id }, vehicle, { upsert: true }).catch(() => {});
    return vehicle;
  }

  deleteVehicle(id: string): boolean {
    const res = this.vehicles.delete(id);
    if (res) {
      this.saveToFile();
      VehicleModel.deleteOne({ id }).catch(() => {});
    }
    return res;
  }

  // Bookings
  getBooking(id: string): Booking | undefined {
    return this.bookings.get(id);
  }

  getAllBookings(): Booking[] {
    return Array.from(this.bookings.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getBookingsByCustomer(customerId: string): Booking[] {
    return this.getAllBookings().filter(b => b.customerId === customerId);
  }

  getBookingsByMechanic(mechanicId: string): Booking[] {
    return this.getAllBookings().filter(b => b.mechanicId === mechanicId);
  }

  createBooking(booking: Booking): Booking {
    this.bookings.set(booking.id, booking);

    // Initial system chat message
    this.chatMessages.set(booking.id, [
      {
        id: `msg-${booking.id}-init`,
        bookingId: booking.id,
        senderId: 'system',
        senderRole: 'system',
        text: `Breakdown reported for ${booking.vehicleInfo.make} ${booking.vehicleInfo.model}. Request dispatched to ${booking.mechanicName || 'mechanic'}.`,
        timestamp: booking.createdAt
      }
    ]);

    // Send notification to mechanic
    this.addNotification({
      id: `notif-${Date.now()}-m`,
      userId: booking.mechanicId,
      title: 'New Roadside Assistance Request! 🚨',
      message: `${booking.customerName} needs help with ${booking.problemType.replace(/_/g, ' ')} at ${booking.customerAddress}`,
      type: 'warning',
      bookingId: booking.id,
      read: false,
      createdAt: new Date().toISOString()
    });

    return booking;
  }

  updateBookingStatus(id: string, status: BookingStatus, note?: string): Booking | undefined {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    booking.status = status;
    booking.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${status.replace(/_/g, ' ')}`
    });

    if (status === 'repair_completed' || status === 'payment_completed') {
      booking.completedAt = new Date().toISOString();
    }

    // Add chat alert for status
    this.addChatMessage(id, {
      id: `msg-${Date.now()}`,
      bookingId: id,
      senderId: 'system',
      senderRole: 'system',
      text: `Status update: ${status.replace(/_/g, ' ').toUpperCase()}${note ? ` - ${note}` : ''}`,
      timestamp: new Date().toISOString()
    });

    // Notify customer
    this.addNotification({
      id: `notif-${Date.now()}-c`,
      userId: booking.customerId,
      title: `Update on Booking ${booking.id}`,
      message: `Mechanic updated job status: ${status.replace(/_/g, ' ')}`,
      type: 'info',
      bookingId: booking.id,
      read: false,
      createdAt: new Date().toISOString()
    });

    this.bookings.set(id, booking);
    return booking;
  }

  addSparePartToBooking(bookingId: string, part: SparePart): Booking | undefined {
    const booking = this.bookings.get(bookingId);
    if (!booking) return undefined;

    booking.spareParts.push(part);
    const partsTotal = booking.spareParts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    booking.pricing.parts = partsTotal;
    booking.pricing.total =
      booking.pricing.baseService +
      booking.pricing.travelCharge +
      booking.pricing.labour +
      booking.pricing.parts +
      booking.pricing.additionalCharges;

    this.bookings.set(bookingId, booking);
    return booking;
  }

  addAdditionalChargeToBooking(bookingId: string, charge: AdditionalCharge): Booking | undefined {
    const booking = this.bookings.get(bookingId);
    if (!booking) return undefined;

    booking.additionalCharges.push(charge);
    // Don't add to total until customer approves

    // Notify customer to approve
    this.addNotification({
      id: `notif-${Date.now()}-charge`,
      userId: booking.customerId,
      title: 'Additional Charge Approval Needed ⚠️',
      message: `Mechanic requested additional charge: ₹${charge.amount} for "${charge.description}". Please approve or reject in tracking screen.`,
      type: 'warning',
      bookingId: booking.id,
      read: false,
      createdAt: new Date().toISOString()
    });

    this.bookings.set(bookingId, booking);
    return booking;
  }

  approveAdditionalCharge(bookingId: string, chargeId: string, approved: boolean): Booking | undefined {
    const booking = this.bookings.get(bookingId);
    if (!booking) return undefined;

    const chg = booking.additionalCharges.find(c => c.id === chargeId);
    if (!chg) return undefined;

    chg.approvedByCustomer = approved;
    const approvedChargesTotal = booking.additionalCharges
      .filter(c => c.approvedByCustomer)
      .reduce((sum, c) => sum + c.amount, 0);

    booking.pricing.additionalCharges = approvedChargesTotal;
    booking.pricing.total =
      booking.pricing.baseService +
      booking.pricing.travelCharge +
      booking.pricing.labour +
      booking.pricing.parts +
      booking.pricing.additionalCharges;

    this.bookings.set(bookingId, booking);
    return booking;
  }

  updateBookingPricing(bookingId: string, pricingUpdates: Partial<Booking['pricing']>, workNotes?: string, diagnosisNotes?: string): Booking | undefined {
    const booking = this.bookings.get(bookingId);
    if (!booking) return undefined;

    if (workNotes) booking.workPerformed = workNotes;
    if (diagnosisNotes) booking.mechanicDiagnosisNotes = diagnosisNotes;

    booking.pricing = { ...booking.pricing, ...pricingUpdates };
    booking.pricing.total =
      booking.pricing.baseService +
      booking.pricing.travelCharge +
      booking.pricing.labour +
      booking.pricing.parts +
      booking.pricing.additionalCharges;

    this.bookings.set(bookingId, booking);
    return booking;
  }

  // Invoices & Payments
  getInvoiceByBookingId(bookingId: string): Invoice | undefined {
    return Array.from(this.invoices.values()).find(inv => inv.bookingId === bookingId);
  }

  getAllInvoices(): Invoice[] {
    return Array.from(this.invoices.values());
  }

  createInvoice(invoice: Invoice): Invoice {
    this.invoices.set(invoice.invoiceNumber, invoice);
    return invoice;
  }

  createPayment(payment: Payment): Payment {
    this.payments.set(payment.id, payment);
    // Mark booking payment completed
    const booking = this.bookings.get(payment.bookingId);
    if (booking) {
      this.updateBookingStatus(payment.bookingId, 'payment_completed', `Payment of ₹${payment.amount} settled via ${payment.method.toUpperCase()}`);
      booking.pricing.isFinal = true;

      // Update mechanic earnings
      const mechProfile = this.mechanics.get(booking.mechanicId);
      if (mechProfile) {
        mechProfile.todayEarnings += payment.amount;
        mechProfile.totalEarnings += payment.amount;
        mechProfile.totalRepairs += 1;
        this.mechanics.set(booking.mechanicId, mechProfile);
      }

      // Generate invoice
      const inv: Invoice = {
        invoiceNumber: `INV-${booking.id.replace('RR-', '')}`,
        bookingId: booking.id,
        customerId: booking.customerId,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        mechanicId: booking.mechanicId,
        mechanicName: booking.mechanicName || 'Certified Mechanic',
        mechanicWorkshop: mechProfile?.workshopName || 'RoadRescue Mobile Care',
        vehicleInfo: `${booking.vehicleInfo.make} ${booking.vehicleInfo.model} (${booking.vehicleInfo.regNo})`,
        serviceDate: new Date().toISOString(),
        breakdownSummary: booking.problemDescription,
        items: [
          { description: 'Emergency Roadside Inspection & Base Callout', amount: booking.pricing.baseService },
          { description: `Travel & Dispatch Fee (${booking.distanceKm} km)`, amount: booking.pricing.travelCharge },
          { description: 'On-site Technical Labour', amount: booking.pricing.labour },
          ...booking.spareParts.map(p => ({ description: `${p.name} (Qty: ${p.quantity})`, amount: p.price * p.quantity })),
          ...booking.additionalCharges.filter(c => c.approvedByCustomer).map(c => ({ description: c.description, amount: c.amount }))
        ],
        subtotal: booking.pricing.total,
        tax: Math.round(booking.pricing.total * 0.18),
        total: Math.round(booking.pricing.total * 1.18),
        paymentMethod: payment.method.toUpperCase(),
        paymentStatus: 'paid',
        paidAt: payment.paidAt
      };
      this.invoices.set(inv.invoiceNumber, inv);
    }
    return payment;
  }

  // Reviews
  getReviewsByMechanic(mechanicId: string): Review[] {
    return Array.from(this.reviews.values()).filter(r => r.mechanicId === mechanicId);
  }

  getAllReviews(): Review[] {
    return Array.from(this.reviews.values());
  }

  addReview(review: Review): Review {
    this.reviews.set(review.id, review);

    // Update mechanic average rating
    const mechReviews = this.getReviewsByMechanic(review.mechanicId);
    const avg = mechReviews.reduce((sum, r) => sum + r.overallRating, 0) / mechReviews.length;
    const profile = this.mechanics.get(review.mechanicId);
    if (profile) {
      profile.rating = Math.round(avg * 10) / 10;
      profile.reviewCount = mechReviews.length;
      this.mechanics.set(review.mechanicId, profile);
    }

    return review;
  }

  // Notifications
  getNotificationsByUser(userId: string): Notification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addNotification(notification: Notification): Notification {
    this.notifications.set(notification.id, notification);
    return notification;
  }

  markNotificationAsRead(id: string): boolean {
    const notif = this.notifications.get(id);
    if (!notif) return false;
    notif.read = true;
    this.notifications.set(id, notif);
    return true;
  }

  // Chat
  getChatMessages(bookingId: string): ChatMessage[] {
    return this.chatMessages.get(bookingId) || [];
  }

  addChatMessage(bookingId: string, message: ChatMessage): ChatMessage {
    const list = this.chatMessages.get(bookingId) || [];
    list.push(message);
    this.chatMessages.set(bookingId, list);
    return message;
  }

  // Maintenance
  getMaintenanceByCustomer(customerId: string): MaintenanceRecord[] {
    return Array.from(this.maintenanceRecords.values()).filter(m => m.customerId === customerId);
  }

  addMaintenanceRecord(record: MaintenanceRecord): MaintenanceRecord {
    this.maintenanceRecords.set(record.id, record);
    return record;
  }

  // Emergency Contacts
  getEmergencyContacts(customerId: string): EmergencyContact[] {
    return Array.from(this.emergencyContacts.values()).filter(ec => ec.customerId === customerId);
  }

  addEmergencyContact(contact: EmergencyContact): EmergencyContact {
    this.emergencyContacts.set(contact.id, contact);
    return contact;
  }

  deleteEmergencyContact(id: string): boolean {
    return this.emergencyContacts.delete(id);
  }

  // Complaints
  getAllComplaints(): Complaint[] {
    return Array.from(this.complaints.values());
  }

  createComplaint(complaint: Complaint): Complaint {
    this.complaints.set(complaint.id, complaint);
    return complaint;
  }

  updateComplaintStatus(id: string, status: Complaint['status'], resolutionNote?: string): Complaint | undefined {
    const comp = this.complaints.get(id);
    if (!comp) return undefined;
    comp.status = status;
    if (resolutionNote) comp.resolutionNote = resolutionNote;
    this.complaints.set(id, comp);
    return comp;
  }
}

export const db = new DatabaseStore();
