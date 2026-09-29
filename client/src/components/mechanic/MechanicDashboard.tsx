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
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/40 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-white">{user?.name}</h2>
              {profile?.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Pro
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{profile?.workshopName || 'Certified Mobile Workshop'}</p>
            <div className="flex items-center gap-3 text-xs text-slate-300 mt-1.5 flex-wrap">
              <span className="text-amber-400 font-bold">★ {profile?.rating || 4.9}</span>
              <span>({profile?.reviewCount || 0} reviews)</span>
              <span>•</span>
              <span>{profile?.experienceYears || 8} yrs experience</span>
              <span>•</span>
              <span className="text-slate-400">📍 {profile?.address}</span>
            </div>
          </div>
        </div>

        {/* Online/Offline Toggle */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-white">
              {profile?.isOnline ? 'Online for Dispatch' : 'Offline / Off Duty'}
            </div>
            <div className="text-[10px] text-slate-400">
              {profile?.isOnline ? 'Receiving emergency pings' : 'Requests will be rerouted'}
            </div>
          </div>
          <button
            onClick={handleToggleOnline}
            className={`p-1.5 rounded-xl transition-colors ${
              profile?.isOnline ? 'text-emerald-400' : 'text-slate-600'
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
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Today's Earnings</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ₹{profile?.todayEarnings || 2450}
          </div>
          <span className="text-[10px] text-slate-500">Instant payout eligible</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Revenue</span>
          <div className="text-2xl font-black text-amber-400 font-mono">
            ₹{((profile?.totalEarnings || 384000) / 1000).toFixed(1)}k
          </div>
          <span className="text-[10px] text-slate-500">Lifetime on Roadfix</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Completed Repairs</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">
            {profile?.totalRepairs || 412}
          </div>
          <span className="text-[10px] text-slate-500">Zero safety incidents</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Customer Rating</span>
          <div className="text-2xl font-black text-amber-400 font-mono flex items-center gap-1">
            <span>{profile?.rating || 4.9}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[10px] text-slate-500">Top 5% in Mumbai</span>
        </div>
      </div>

      {/* ACTIVE JOB BANNER (If mechanic currently on a job) */}
      {activeJob && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/60 shadow-xl space-y-4 glow-amber">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Wrench className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-slate-950">
                    Active Job In Progress
                  </span>
                  <span className="font-mono text-xs text-amber-400 font-bold">{activeJob.id}</span>
                </div>
                <h3 className="text-base font-extrabold text-white mt-1">
                  {activeJob.customerName} • {activeJob.vehicleInfo.make} {activeJob.vehicleInfo.model}
                </h3>
                <p className="text-xs text-slate-300">
                  Status: <strong className="text-amber-400 uppercase">{activeJob.status.replace(/_/g, ' ')}</strong> • Location: {activeJob.customerAddress}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenChat(activeJob.id)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Chat
              </button>
              <button
                onClick={() => onOpenJobScreen(activeJob.id)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
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
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">Incoming Emergency Requests</h3>
          </div>
          <span className="text-xs text-slate-400">{requests.length} pending</span>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            No pending incoming requests right now. Keep your toggle Online to receive requests.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3.5 shadow-lg relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {req.id}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">
                      {req.customerName} ({req.customerPhone})
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-amber-400 font-mono">
                      ₹{req.pricing.total}
                    </span>
                    <div className="text-[10px] text-slate-400">Estimated Total</div>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-white font-medium">
                    <Car className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.vehicleInfo.make} {req.vehicleInfo.model} ({req.vehicleInfo.regNo})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">{req.customerAddress}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span className="text-cyan-400">📍 {req.distanceKm} km away</span>
                    <span>•</span>
                    <span className="text-emerald-400">⏱️ ~{req.etaMinutes} mins ETA</span>
                  </div>
                </div>

                {/* AI Problem and Recommended Equipment */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="text-[10px] uppercase font-bold text-amber-400">
                    AI Diagnosis: {req.aiDiagnosis?.problemTitle || req.problemType}
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    "{req.problemDescription}"
                  </p>
                  <div className="pt-1 flex flex-wrap gap-1">
                    {req.aiDiagnosis?.requiredEquipment.map((eq, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        🛠️ {eq}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleRejectRequest(req.id)}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-colors"
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
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          Recent Customer Reviews & Feedback
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.slice(0, 4).map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={rev.customerAvatar}
                    alt={rev.customerName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">{rev.customerName}</span>
                    <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <span>{rev.overallRating}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
              </div>
              <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
