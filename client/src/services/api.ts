import {
  User,
  Vehicle,
  Booking,
  BookingStatus,
  SparePart,
  AIDiagnosis,
  Review,
  Complaint,
  Notification,
  ChatMessage,
  MaintenanceRecord,
  EmergencyContact,
  MechanicMatchResult,
  Invoice
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('roadfix_token') || localStorage.getItem('roadrescue_token');
  const userId = localStorage.getItem('roadfix_user_id') || localStorage.getItem('roadrescue_user_id');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const api = {
  // Auth
  getDemoUsers: () => fetchJson<{ success: boolean; demoUsers: any[] }>('/auth/demo-users'),
  login: (email: string, password?: string) =>
    fetchJson<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  register: (payload: any) =>
    fetchJson<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getMe: () => fetchJson<{ success: boolean; user: User }>('/auth/me'),
  updateProfile: (payload: any) =>
    fetchJson<{ success: boolean; message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  // Vehicles
  getVehicles: (customerId?: string) =>
    fetchJson<{ success: boolean; vehicles: Vehicle[] }>(`/vehicles${customerId ? `?customerId=${customerId}` : ''}`),
  addVehicle: (vehicle: Partial<Vehicle>) =>
    fetchJson<{ success: boolean; vehicle: Vehicle }>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle)
    }),
  deleteVehicle: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/vehicles/${id}`, {
      method: 'DELETE'
    }),

  // Mechanics
  getMechanics: (params?: { isOnline?: boolean; vehicleType?: string }) => {
    const q = new URLSearchParams();
    if (params?.isOnline) q.append('isOnline', 'true');
    if (params?.vehicleType) q.append('vehicleType', params.vehicleType);
    return fetchJson<{ success: boolean; mechanics: any[] }>(`/mechanics?${q.toString()}`);
  },
  getMechanic: (id: string) => fetchJson<{ success: boolean; mechanic: any }>(`/mechanics/${id}`),
  matchMechanics: (payload: {
    customerLat: number;
    customerLng: number;
    vehicleType: string;
    problemType: string;
    requiredEquipment: string[];
  }) =>
    fetchJson<{ success: boolean; matches: MechanicMatchResult[] }>('/mechanics/match', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateMechanicStatus: (id: string, isOnline: boolean, currentLat?: number, currentLng?: number) =>
    fetchJson<{ success: boolean; profile: any }>(`/mechanics/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isOnline, currentLat, currentLng })
    }),
  updateMechanicProfile: (id: string, updates: any) =>
    fetchJson<{ success: boolean; profile: any }>(`/mechanics/${id}/profile`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  // Bookings
  getBookings: (params?: { customerId?: string; mechanicId?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.customerId) q.append('customerId', params.customerId);
    if (params?.mechanicId) q.append('mechanicId', params.mechanicId);
    if (params?.status) q.append('status', params.status);
    return fetchJson<{ success: boolean; bookings: Booking[] }>(`/bookings?${q.toString()}`);
  },
  getBooking: (id: string) =>
    fetchJson<{ success: boolean; booking: Booking; chat: ChatMessage[]; invoice?: Invoice }>(`/bookings/${id}`),
  createBooking: (payload: any) =>
    fetchJson<{ success: boolean; booking: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateBookingStatus: (id: string, status: BookingStatus, note?: string) =>
    fetchJson<{ success: boolean; booking: Booking }>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note })
    }),
  addSparePart: (bookingId: string, part: SparePart) =>
    fetchJson<{ success: boolean; booking: Booking }>(`/bookings/${bookingId}/spare-parts`, {
      method: 'POST',
      body: JSON.stringify(part)
    }),
  requestAdditionalCharge: (bookingId: string, description: string, amount: number) =>
    fetchJson<{ success: boolean; booking: Booking; charge: any }>(`/bookings/${bookingId}/additional-charge`, {
      method: 'POST',
      body: JSON.stringify({ description, amount })
    }),
  approveAdditionalCharge: (bookingId: string, chargeId: string, approved: boolean) =>
    fetchJson<{ success: boolean; booking: Booking }>(`/bookings/${bookingId}/approve-charge`, {
      method: 'POST',
      body: JSON.stringify({ chargeId, approved })
    }),
  updatePricing: (bookingId: string, pricingUpdates: any) =>
    fetchJson<{ success: boolean; booking: Booking }>(`/bookings/${bookingId}/pricing`, {
      method: 'PATCH',
      body: JSON.stringify(pricingUpdates)
    }),

  // AI
  diagnose: (payload: {
    problemType: string;
    description: string;
    vehicleType: string;
    vehicleMake?: string;
    vehicleModel?: string;
    imageDataUri?: string;
  }) =>
    fetchJson<{ success: boolean; diagnosis: AIDiagnosis }>('/ai/diagnose', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  imageAnalysis: (imageDataUri: string, problemHint?: string) =>
    fetchJson<{ success: boolean; analysis: any }>('/ai/image-analysis', {
      method: 'POST',
      body: JSON.stringify({ imageDataUri, problemHint })
    }),
  askAssistant: (query: string) =>
    fetchJson<{ success: boolean; response: any }>('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ query })
    }),

  // Payments
  processPayment: (payload: {
    bookingId: string;
    customerId: string;
    amount: number;
    method: 'upi' | 'card' | 'wallet' | 'cash';
    upiId?: string;
    cardLast4?: string;
  }) =>
    fetchJson<{ success: boolean; payment: any; invoice: Invoice }>('/payments/process', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getInvoice: (bookingId: string) =>
    fetchJson<{ success: boolean; invoice: Invoice }>(`/payments/invoice/${bookingId}`),

  // Reviews
  getReviews: (mechanicId?: string) =>
    fetchJson<{ success: boolean; reviews: Review[] }>(`/reviews${mechanicId ? `?mechanicId=${mechanicId}` : ''}`),
  addReview: (review: Partial<Review>) =>
    fetchJson<{ success: boolean; review: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(review)
    }),

  // Chat
  getChat: (bookingId: string) =>
    fetchJson<{ success: boolean; messages: ChatMessage[] }>(`/chat/${bookingId}`),
  sendMessage: (bookingId: string, senderId: string, senderRole: string, text: string) =>
    fetchJson<{ success: boolean; message: ChatMessage }>(`/chat/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify({ senderId, senderRole, text })
    }),

  // Maintenance
  getMaintenance: (customerId?: string) =>
    fetchJson<{ success: boolean; records: MaintenanceRecord[]; reminders: any[] }>(
      `/maintenance${customerId ? `?customerId=${customerId}` : ''}`
    ),
  addMaintenanceRecord: (payload: any) =>
    fetchJson<{ success: boolean; record: MaintenanceRecord }>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // SOS
  getEmergencyContacts: (customerId?: string) =>
    fetchJson<{ success: boolean; contacts: EmergencyContact[] }>(
      `/sos/contacts${customerId ? `?customerId=${customerId}` : ''}`
    ),
  addEmergencyContact: (payload: { customerId: string; name: string; phone: string; relationship: string }) =>
    fetchJson<{ success: boolean; contact: EmergencyContact }>('/sos/contacts', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  deleteEmergencyContact: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/sos/contacts/${id}`, {
      method: 'DELETE'
    }),
  triggerSOS: (payload: { customerId: string; lat: number; lng: number; address: string }) =>
    fetchJson<{ success: boolean; sos: any }>('/sos/trigger', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Admin
  getAdminStats: () => fetchJson<{ success: boolean; stats: any }>('/admin/stats'),
  getAdminUsers: () => fetchJson<{ success: boolean; users: User[] }>('/admin/users'),
  blockUser: (id: string, isBlocked: boolean) =>
    fetchJson<{ success: boolean; user: User }>(`/admin/users/${id}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ isBlocked })
    }),
  verifyMechanic: (id: string, isVerified: boolean) =>
    fetchJson<{ success: boolean; profile: any }>(`/admin/mechanics/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ isVerified })
    }),
  getComplaints: () => fetchJson<{ success: boolean; complaints: Complaint[] }>('/admin/complaints'),
  updateComplaint: (id: string, status: string, resolutionNote?: string) =>
    fetchJson<{ success: boolean; complaint: Complaint }>(`/admin/complaints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNote })
    }),
  getPricingCatalog: () => fetchJson<{ success: boolean; catalog: any[] }>('/admin/pricing-catalog'),
  updatePricingCatalog: (id: string, updates: any) =>
    fetchJson<{ success: boolean; item: any }>(`/admin/pricing-catalog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  // Notifications
  getNotifications: (userId?: string) =>
    fetchJson<{ success: boolean; notifications: Notification[]; unreadCount: number }>(
      `/notifications${userId ? `?userId=${userId}` : ''}`
    ),
  markNotificationRead: (id: string) =>
    fetchJson<{ success: boolean; updated: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH'
    })
};
