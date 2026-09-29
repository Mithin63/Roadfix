import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Booking, BookingStatus } from '../../types';
import { MapLeaflet } from '../common/MapLeaflet';
import {
  Navigation,
  PhoneCall,
  MessageSquare,
  Share2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  FileText,
  Copy,
  Check,
  XCircle,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface TrackingScreenProps {
  bookingId?: string;
  onOpenChat: (bookingId: string) => void;
  onOpenPayment: (bookingId: string) => void;
  onOpenReview: (bookingId: string) => void;
  onBackToHome: () => void;
}

export const TrackingScreen: React.FC<TrackingScreenProps> = ({
  bookingId,
  onOpenChat,
  onOpenPayment,
  onOpenReview,
  onBackToHome
}) => {
  const { user, detectLocation } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [simulatedCall, setSimulatedCall] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Vehicle started / problem resolved on my own');
  const [isCancelling, setIsCancelling] = useState(false);

  // Status step order 1 to 9
  const statusSteps: { id: BookingStatus; label: string; desc: string }[] = [
    { id: 'requested', label: 'Booking Requested', desc: 'Dispatched to certified mechanic network' },
    { id: 'accepted', label: 'Mechanic Accepted', desc: 'Mechanic verified service request' },
    { id: 'preparing_equipment', label: 'Preparing Equipment', desc: 'Packing recommended tools & testing kit' },
    { id: 'travelling', label: 'Mechanic Travelling', desc: 'En route with live GPS telemetry' },
    { id: 'arrived', label: 'Mechanic Arrived', desc: 'On-site at customer vehicle location' },
    { id: 'diagnosis_started', label: 'Diagnosis Started', desc: 'Physical inspection and OBD2 scan' },
    { id: 'repair_in_progress', label: 'Repair In Progress', desc: 'Parts installation and troubleshooting' },
    { id: 'repair_completed', label: 'Repair Completed', desc: 'Final testing and quality check completed' },
    { id: 'payment_completed', label: 'Payment Completed', desc: 'Digital invoice generated and settled' }
  ];

  const fetchBooking = async () => {
    try {
      if (bookingId) {
        const res = await api.getBooking(bookingId);
        setBooking(res.booking);
      } else if (user) {
        const res = await api.getBookings({ customerId: user.id });
        if (res.bookings && res.bookings.length > 0) {
          // Select most recent active booking
          const active = res.bookings.find(b => !['payment_completed', 'cancelled'].includes(b.status)) || res.bookings[0];
          setBooking(active);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    const interval = setInterval(fetchBooking, 4000); // 4s live polling
    return () => clearInterval(interval);
  }, [bookingId, user]);

  const handleShareTrip = () => {
    if (!booking) return;
    const url = window.location.origin + `?track=${booking.id}`;
    navigator.clipboard.writeText(`Track my Roadfix roadside assistance live: ${url}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleApproveCharge = async (chargeId: string, approved: boolean) => {
    if (!booking) return;
    try {
      const res = await api.approveAdditionalCharge(booking.id, chargeId, approved);
      setBooking(res.booking);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    setIsCancelling(true);
    try {
      const res = await api.updateBookingStatus(booking.id, 'cancelled', `Cancelled by customer: ${cancelReason}`);
      setBooking(res.booking);
      setShowCancelModal(false);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading live tracking telemetry...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <Navigation className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Active Roadside Booking</h3>
        <p className="text-xs text-slate-400">
          You currently don't have an ongoing roadside assistance request.
        </p>
        <button
          onClick={onBackToHome}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  // Calculate current step index
  const currentStepIndex = statusSteps.findIndex(s => s.id === booking.status);

  // Pending charges that need customer decision
  const pendingCharges = booking.additionalCharges?.filter(c => !c.approvedByCustomer);

  // Google Maps URL with Live Route Navigation
  const googleMapsRouteUrl = booking.mechanicLat && booking.mechanicLng
    ? `https://www.google.com/maps/dir/?api=1&origin=${booking.mechanicLat},${booking.mechanicLng}&destination=${booking.customerLat},${booking.customerLng}`
    : `https://www.google.com/maps?q=${booking.customerLat},${booking.customerLng}`;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Universal Top Navigation Bar with Back Button & Direct Action */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>← Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Google Maps External Link */}
          <a
            href={googleMapsRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-md"
          >
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>Open in Google Maps ↗</span>
          </a>

          {/* Cancel Button (if active) */}
          {booking.status !== 'cancelled' && booking.status !== 'payment_completed' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Request</span>
            </button>
          )}
        </div>
      </div>

      {/* Booking Cancelled Notice */}
      {booking.status === 'cancelled' && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <div className="font-bold text-sm text-white">This Roadside Request was Cancelled</div>
              <div className="text-xs text-slate-400 mt-0.5">No charges will be levied. You can request fresh assistance anytime.</div>
            </div>
          </div>
          <button
            onClick={onBackToHome}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs self-start sm:self-auto"
          >
            Return to Dashboard
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Navigation className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                {booking.id}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-semibold capitalize">
                {booking.vehicleInfo.make} {booking.vehicleInfo.model} ({booking.vehicleInfo.regNo})
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
              Live Status: {booking.status.replace(/_/g, ' ').toUpperCase()}
            </h2>
            <p className="text-xs text-slate-400">
              {booking.customerAddress}
            </p>
          </div>
        </div>

        {/* Action buttons: Call, Chat, Share, Google Maps */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => setSimulatedCall(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Mechanic</span>
          </button>

          <button
            onClick={() => onOpenChat(booking.id)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>

          <button
            onClick={handleShareTrip}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Trip'}</span>
          </button>
        </div>
      </div>

      {/* ADDITIONAL CHARGE APPROVAL ALERT (Section 10) */}
      {pendingCharges && pendingCharges.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500 space-y-3 glow-amber">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Action Required: Mechanic Requested Additional Work & Charges</span>
          </div>
          <p className="text-xs text-slate-300">
            Before proceeding, please review and approve or reject the following additional parts / labor:
          </p>
          <div className="space-y-2">
            {pendingCharges.map((chg) => (
              <div key={chg.id} className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white">{chg.description}</div>
                  <div className="text-xs font-black text-amber-400 mt-0.5">₹{chg.amount}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveCharge(chg.id, false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveCharge(chg.id, true)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                  >
                    Approve Charge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Map & Status Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Map */}
        <div className="lg:col-span-2 space-y-4">
          <MapLeaflet
            center={[booking.customerLat, booking.customerLng]}
            zoom={14}
            customerPoint={{
              lat: booking.customerLat,
              lng: booking.customerLng,
              title: `${booking.customerName} (${booking.vehicleInfo.model})`,
              subtitle: booking.customerAddress,
              type: 'customer'
            }}
            mechanicPoint={
              booking.mechanicLat && booking.mechanicLng
                ? {
                    lat: booking.mechanicLat,
                    lng: booking.mechanicLng,
                    title: `Mechanic ${booking.mechanicName || ''}`,
                    subtitle: `ETA: ~${booking.etaMinutes} mins`,
                    type: 'mechanic'
                  }
                : undefined
            }
            showRoute={Boolean(booking.mechanicLat && booking.mechanicLng)}
            height="400px"
          />

          {/* Mechanic Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={booking.mechanicAvatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'}
                alt={booking.mechanicName || 'Mechanic'}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-700 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{booking.mechanicName || 'Assigned Technician'}</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400">Roadfix Mobile Rescue Unit</p>
                <div className="text-xs text-amber-400 font-semibold mt-1">
                  📞 {booking.mechanicPhone || '+91 98205 77112'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Estimated Arrival</div>
              <div className="text-lg font-black text-emerald-400">
                {booking.status === 'arrived' || booking.status === 'diagnosis_started' || booking.status === 'repair_in_progress' || booking.status === 'repair_completed'
                  ? 'On-Site'
                  : `~${booking.etaMinutes} Mins`}
              </div>
              <div className="text-[10px] text-slate-400">
                {booking.distanceKm} km away
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 9-Step Timeline & Bill Summary */}
        <div className="space-y-4">
          {/* Timeline */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Assistance Progress Timeline
            </h3>

            <div className="space-y-3 relative pl-4 border-l-2 border-slate-800">
              {statusSteps.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.id} className="relative group text-left">
                    {/* Circle dot indicator */}
                    <div
                      className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        isCurrent
                          ? 'bg-amber-400 border-white ring-4 ring-amber-400/20 animate-pulse'
                          : isPassed
                          ? 'bg-emerald-500 border-emerald-400'
                          : 'bg-slate-950 border-slate-700'
                      }`}
                    />

                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-amber-400'
                            : isPassed
                            ? 'text-white'
                            : 'text-slate-500'
                        }`}
                      >
                        {idx + 1}. {step.label}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bill summary & Payment triggers */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                {booking.pricing.isFinal ? 'Final Total Bill' : 'Current Estimated Cost'}
              </span>
              <span className="text-lg font-black text-amber-400 font-mono">
                ₹{booking.pricing.total}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-2">
              <div className="flex justify-between">
                <span>Base Service</span>
                <span className="font-mono">₹{booking.pricing.baseService}</span>
              </div>
              <div className="flex justify-between">
                <span>Travel Fee</span>
                <span className="font-mono">₹{booking.pricing.travelCharge}</span>
              </div>
              <div className="flex justify-between">
                <span>Labour</span>
                <span className="font-mono">₹{booking.pricing.labour}</span>
              </div>
              {booking.pricing.parts > 0 && (
                <div className="flex justify-between">
                  <span>Parts Installed</span>
                  <span className="font-mono">₹{booking.pricing.parts}</span>
                </div>
              )}
              {booking.pricing.additionalCharges > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>Approved Additional Charges</span>
                  <span className="font-mono">₹{booking.pricing.additionalCharges}</span>
                </div>
              )}
            </div>

            {/* If repair is completed, show Proceed to Payment button */}
            {booking.status === 'repair_completed' && (
              <button
                onClick={() => onOpenPayment(booking.id)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-transform hover:scale-[1.02]"
              >
                <CreditCard className="w-4 h-4" />
                <span>Repair Finished — Pay Now (₹{booking.pricing.total})</span>
              </button>
            )}

            {/* If payment completed, show invoice & rate button */}
            {booking.status === 'payment_completed' && (
              <div className="space-y-2 pt-2">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Payment Completed & Settled
                </div>
                <button
                  onClick={() => onOpenPayment(booking.id)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View Digital Tax Invoice
                </button>
                <button
                  onClick={() => onOpenReview(booking.id)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
                >
                  Rate & Review Mechanic
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Phone Call Modal */}
      {simulatedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
              <PhoneCall className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Calling {booking.mechanicName}...</h3>
              <p className="text-xs text-slate-400 mt-1">{booking.mechanicPhone || '+91 98205 77112'}</p>
              <p className="text-[11px] text-amber-400 mt-2 font-mono">Simulated In-App Roadfix Voice Link Connected</p>
            </div>
            <button
              onClick={() => setSimulatedCall(false)}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {/* Cancel Request Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-red-500/40 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cancel Roadside Assistance?</h3>
                <p className="text-xs text-slate-400">Request: <span className="font-mono text-amber-400">{booking.id}</span></p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to cancel this breakdown request? The assigned mechanic ({booking.mechanicName || 'Technician'}) will be notified immediately.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Select Cancellation Reason:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-400"
              >
                <option value="Vehicle started / problem resolved on my own">Vehicle started / problem resolved on my own</option>
                <option value="Found another local mechanic nearby">Found another local mechanic nearby</option>
                <option value="ETA is taking too long">ETA is taking too long</option>
                <option value="Towing / Family help arrived">Towing / Family help arrived</option>
                <option value="Booked by mistake">Booked by mistake</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Keep Request
              </button>
              <button
                disabled={isCancelling}
                onClick={handleCancelBooking}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30"
              >
                <XCircle className="w-4 h-4" />
                <span>{isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

