import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Booking, MechanicProfile } from '../../types';
import {
  Wrench,
  DollarSign,
  Star,
  CheckCircle2,
  Navigation,
  Clock,
  PhoneCall,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Car
} from 'lucide-react';

interface MechanicDashboardProps {
  onOpenJobScreen: (bookingId: string) => void;
  onOpenChat: (bookingId: string) => void;
}

export const MechanicDashboard: React.FC<MechanicDashboardProps> = ({
  onOpenJobScreen,
  onOpenChat
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MechanicProfile | null>(null);
  const [requests, setRequests] = useState<Booking[]>([]);
  const [activeJob, setActiveJob] = useState<Booking | null>(null);
  const [completedJobs, setCompletedJobs] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMechanicData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [mechRes, bookingsRes, reviewsRes] = await Promise.all([
        api.getMechanic(user.id),
        api.getBookings({ mechanicId: user.id }),
        api.getReviews(user.id)
      ]);

      setProfile(mechRes.mechanic.profile);
      setReviews(reviewsRes.reviews || []);

      const all = bookingsRes.bookings || [];
      const incoming = all.filter(b => b.status === 'requested');
      const active = all.find(b =>
        ['accepted', 'preparing_equipment', 'travelling', 'arrived', 'diagnosis_started', 'repair_in_progress'].includes(b.status)
      );
      const completed = all.filter(b => ['repair_completed', 'payment_completed'].includes(b.status));

      setRequests(incoming);
      setActiveJob(active || null);
      setCompletedJobs(completed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanicData();
    const interval = setInterval(fetchMechanicData, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const handleToggleOnline = async () => {
    if (!user || !profile) return;
    const newStatus = !profile.isOnline;
    try {
      await api.updateMechanicStatus(user.id, newStatus);
      setProfile({ ...profile, isOnline: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptRequest = async (bookingId: string) => {
    try {
      await api.updateBookingStatus(bookingId, 'accepted', 'Mechanic accepted service request');
      fetchMechanicData();
      onOpenJobScreen(bookingId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (bookingId: string) => {
    try {
      await api.updateBookingStatus(bookingId, 'cancelled', 'Mechanic is occupied with another repair');
      fetchMechanicData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in text-left">
      {/* Top Profile & Availability Bar */}
      <div className="p-6 rounded-3xl bg-[#111A2E] border border-[#1E2C48] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#FFB51B]/40 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-[#F1F5F9] font-heading">{user?.name}</h2>
              {profile?.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Pro
                </span>
              )}
            </div>
            <p className="text-xs text-[#94A3B8]">{profile?.workshopName || 'Certified Mobile Workshop'}</p>
            <div className="flex items-center gap-3 text-xs text-[#94A3B8] mt-1.5 flex-wrap">
              <span className="text-[#FFB51B] font-bold">★ {profile?.rating || 4.9}</span>
              <span>({profile?.reviewCount || 0} reviews)</span>
              <span>•</span>
              <span>{profile?.experienceYears || 8} yrs experience</span>
              <span>•</span>
              <span className="text-[#94A3B8]">📍 {profile?.address}</span>
            </div>
          </div>
        </div>

        {/* Online/Offline Toggle */}
        <div className="flex items-center gap-3 bg-[#080D1C]/80 p-3 rounded-2xl border border-[#1E2C48] shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-[#F1F5F9] font-heading">
              {profile?.isOnline ? 'Online for Dispatch' : 'Offline / Off Duty'}
            </div>
            <div className="text-[10px] text-[#94A3B8]">
              {profile?.isOnline ? 'Receiving emergency pings' : 'Requests will be rerouted'}
            </div>
          </div>
          <button
            onClick={handleToggleOnline}
            className={`p-1.5 rounded-xl transition-colors ${
              profile?.isOnline ? 'text-[#10B981]' : 'text-slate-600'
            }`}
          >
            {profile?.isOnline ? (
              <ToggleRight className="w-10 h-10" />
            ) : (
              <ToggleLeft className="w-10 h-10" />
            )}
          </button>
        </div>
      </div>

      {/* METRICS COUNTER CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111A2E] border border-[#1E2C48] space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider font-heading">Today's Earnings</span>
          <div className="text-2xl font-black text-[#10B981] font-mono">
            ₹{profile?.todayEarnings || 2450}
          </div>
          <span className="text-[10px] text-[#64748B]">Instant payout eligible</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111A2E] border border-[#1E2C48] space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider font-heading">Total Revenue</span>
          <div className="text-2xl font-black text-[#FFB51B] font-mono">
            ₹{((profile?.totalEarnings || 384000) / 1000).toFixed(1)}k
          </div>
          <span className="text-[10px] text-[#64748B]">Lifetime on Roadfix</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111A2E] border border-[#1E2C48] space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider font-heading">Completed Repairs</span>
          <div className="text-2xl font-black text-[#38BDF8] font-mono">
            {profile?.totalRepairs || 412}
          </div>
          <span className="text-[10px] text-[#64748B]">Zero safety incidents</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111A2E] border border-[#1E2C48] space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider font-heading">Customer Rating</span>
          <div className="text-2xl font-black text-[#FFB51B] font-mono flex items-center gap-1">
            <span>{profile?.rating || 4.9}</span>
            <Star className="w-5 h-5 fill-[#FFB51B] text-[#FFB51B]" />
          </div>
          <span className="text-[10px] text-[#64748B]">Top 5% in Mumbai</span>
        </div>
      </div>

      {/* ACTIVE JOB BANNER (If mechanic currently on a job) */}
      {activeJob && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#FFB51B]/15 via-[#111A2E] to-[#111A2E] border-2 border-[#FFB51B]/60 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#FFB51B]/20 border border-[#FFB51B]/40 flex items-center justify-center text-[#FFB51B] shrink-0">
                <Wrench className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FFB51B] text-[#080D1C] font-heading">
                    Active Job In Progress
                  </span>
                  <span className="font-mono text-xs text-[#FFB51B] font-bold">{activeJob.id}</span>
                </div>
                <h3 className="text-base font-extrabold text-[#F1F5F9] font-heading mt-1">
                  {activeJob.customerName} • {activeJob.vehicleInfo.make} {activeJob.vehicleInfo.model}
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Status: <strong className="text-[#FFB51B] uppercase">{activeJob.status.replace(/_/g, ' ')}</strong> • Location: {activeJob.customerAddress}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenChat(activeJob.id)}
                className="px-4 py-2.5 rounded-xl bg-[#1E2C48] hover:bg-[#2A3E66] text-[#F1F5F9] font-bold text-xs"
              >
                Chat
              </button>
              <button
                onClick={() => onOpenJobScreen(activeJob.id)}
                className="px-6 py-2.5 rounded-xl bg-[#FFB51B] hover:bg-[#FFD166] text-[#080D1C] font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-[#FFB51B]/20 btn-primary-amber"
              >
                <span>Open Job Screen</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 9: NEW SERVICE REQUEST CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#FFB51B]" />
            <h3 className="text-base font-extrabold text-[#F1F5F9] font-heading">Incoming Emergency Requests</h3>
          </div>
          <span className="text-xs text-[#94A3B8]">{requests.length} pending</span>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#111A2E] border border-[#1E2C48] text-center text-xs text-[#94A3B8]">
            No pending incoming requests right now. Keep your toggle Online to receive requests.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-[#111A2E] border border-[#FFB51B]/40 space-y-3.5 shadow-lg relative group hover:border-[#FFB51B] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#FFB51B]/20 text-[#FFD166] border border-[#FFB51B]/30">
                      {req.id}
                    </span>
                    <h4 className="text-sm font-extrabold text-[#F1F5F9] font-heading mt-1.5">
                      {req.customerName} ({req.customerPhone})
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#FFB51B] font-mono">
                      ₹{req.pricing.total}
                    </span>
                    <div className="text-[10px] text-[#94A3B8]">Estimated Total</div>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-[#94A3B8]">
                  <div className="flex items-center gap-1.5 text-[#F1F5F9] font-medium">
                    <Car className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span>{req.vehicleInfo.make} {req.vehicleInfo.model} ({req.vehicleInfo.regNo})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#94A3B8]">
                    <MapPin className="w-3.5 h-3.5 text-[#FFB51B]" />
                    <span className="truncate">{req.customerAddress}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] pt-0.5">
                    <span className="text-[#38BDF8]">📍 {req.distanceKm} km away</span>
                    <span>•</span>
                    <span className="text-[#10B981]">⏱️ ~{req.etaMinutes} mins ETA</span>
                  </div>
                </div>

                {/* AI Problem and Recommended Equipment */}
                <div className="p-3 rounded-xl bg-[#080D1C] border border-[#1E2C48] space-y-1.5 text-xs">
                  <div className="text-[10px] uppercase font-bold text-[#FFB51B] font-heading">
                    AI Diagnosis: {req.aiDiagnosis?.problemTitle || req.problemType}
                  </div>
                  <p className="text-[11px] text-[#94A3B8] line-clamp-2">
                    "{req.problemDescription}"
                  </p>
                  <div className="pt-1 flex flex-wrap gap-1">
                    {req.aiDiagnosis?.requiredEquipment.map((eq, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#111A2E] text-[#94A3B8] border border-[#1E2C48]">
                        🛠️ {eq}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleRejectRequest(req.id)}
                    className="py-2.5 rounded-xl bg-[#1E2C48] hover:bg-[#2A3E66] text-[#94A3B8] hover:text-[#F1F5F9] font-bold text-xs transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="py-2.5 rounded-xl bg-[#FFB51B] hover:bg-[#FFD166] text-[#080D1C] font-extrabold text-xs shadow-md shadow-[#FFB51B]/20 btn-primary-amber transition-colors"
                  >
                    Accept & Dispatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-[#F1F5F9] font-heading flex items-center gap-2">
          <Star className="w-4 h-4 text-[#FFB51B]" />
          Recent Customer Reviews & Feedback
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.slice(0, 4).map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl bg-[#111A2E] border border-[#1E2C48] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={rev.customerAvatar}
                    alt={rev.customerName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#F1F5F9] block font-heading">{rev.customerName}</span>
                    <span className="text-[10px] text-[#94A3B8]">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#FFB51B] text-xs font-bold">
                  <span>{rev.overallRating}</span>
                  <Star className="w-3.5 h-3.5 fill-[#FFB51B] text-[#FFB51B]" />
                </div>
              </div>
              <p className="text-xs text-[#94A3B8] italic">"{rev.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
