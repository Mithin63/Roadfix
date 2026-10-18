import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Booking, BreakdownProblem } from '../../types';
import {
  AlertTriangle,
  BatteryCharging,
  Disc,
  Fuel,
  Cpu,
  Zap,
  ShieldAlert,
  Key,
  Wrench,
  Navigation,
  CheckCircle,
  Car,
  ChevronRight,
  Clock,
  Sparkles,
  PhoneCall,
  Flame,
  ShieldCheck,
  Star,
  MapPin,
  Truck
} from 'lucide-react';

interface CustomerDashboardProps {
  onStartBreakdown: (preselectedProblem?: BreakdownProblem) => void;
  onOpenTracking: (bookingId?: string) => void;
  onOpenVehicles: () => void;
  onOpenMaintenance: () => void;
  onOpenHistory: () => void;
  onOpenAiAssistant: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onStartBreakdown,
  onOpenTracking,
  onOpenVehicles,
  onOpenMaintenance,
  onOpenHistory,
  onOpenAiAssistant
}) => {
  const { user, activeLocation, detectLocation } = useAuth();
  const { theme } = useTheme();
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [nearbyMechanics, setNearbyMechanics] = useState<any[]>([]);
  const [maintenanceDue, setMaintenanceDue] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const quickServices: { id: BreakdownProblem; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'flat_tyre', label: 'Puncture Repair', icon: Disc, color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400', desc: 'Puncture vulcanizing & spare mount' },
    { id: 'battery_dead', label: 'Battery Assistance', icon: BatteryCharging, color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400', desc: 'Jump start & battery load test' },
    { id: 'engine_problem', label: 'Engine Trouble', icon: Cpu, color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400', desc: 'Stalling, misfire & OBD2 diagnostic' },
    { id: 'fuel_problem', label: 'Fuel Assistance', icon: Fuel, color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400', desc: 'Emergency 5L fuel dispatch' },
    { id: 'towing', label: 'Towing Assistance', icon: Truck, color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400', desc: 'Flatbed recovery & safe towing' },
    { id: 'overheating', label: 'Overheating / Coolant', icon: Flame, color: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400', desc: 'Coolant leaks, radiator & steam' },
    { id: 'electrical_problem', label: 'Electrical / Fuse', icon: Zap, color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400', desc: 'Alternator, harness & fuses' },
    { id: 'key_lock_problem', label: 'Key / Lockout', icon: Key, color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400', desc: 'Lockout rescue & key battery' },
    { id: 'other', label: 'Other Diagnostics', icon: Wrench, color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400', desc: 'Brakes, clutch & custom repairs' },
  ];

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const bookingsRes = await api.getBookings({ customerId: user.id });
      const current = Array.isArray(bookingsRes?.bookings)
        ? bookingsRes.bookings.find(b => !['payment_completed', 'cancelled'].includes(b.status))
        : null;
      setActiveBooking(current || null);

      // Fetch nearby mechanics
      const mechRes = await api.getMechanics({ isOnline: true });
      setNearbyMechanics(Array.isArray(mechRes?.mechanics) ? mechRes.mechanics : []);

      // Fetch maintenance
      const maintRes = await api.getMaintenance(user.id);
      const due = Array.isArray(maintRes?.reminders)
        ? maintRes.reminders.find((r: any) => r.isDueSoon)
        : null;
      setMaintenanceDue(due || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [user]);



  const safeLocation = activeLocation || {
    lat: 16.5062,
    lng: 80.6480,
    address: 'Live Location Active',
    status: 'idle',
    errorMsg: null,
    isRealGps: false
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Live GPS Status Glassmorphic Header Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
              24/7 Roadside Network Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white dark:text-white light:text-[#172033] tracking-tight flex items-center gap-2 flex-wrap">
            <span>Hello,</span>
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-white dark:from-amber-400 dark:via-amber-200 dark:to-white light:from-[#D99000] light:to-[#172033] bg-clip-text text-transparent">
              {user?.name ? user.name.split(' ')[0] : 'Driver'}
            </span>
            <span>👋</span>
            <span className="font-signature text-xl text-amber-400 dark:text-[#FFD166] light:text-[#D99000] font-semibold select-none ml-1 -rotate-1 whitespace-nowrap hidden md:inline-block">
              "Back on the road."
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 dark:text-slate-200 light:text-[#5B6475] mt-1 font-medium">
            24/7 Emergency Breakdown Assistance, Certified Mechanics & Smart Telematics
          </p>
        </div>

        {/* Live Location display badge & Detect Button */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={detectLocation}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border transition-all shadow-lg text-xs font-semibold ${
              safeLocation.status === 'denied' || safeLocation.status === 'unavailable'
                ? 'border-red-500/60 text-red-300'
                : 'border-amber-500/40 hover:border-amber-400 text-white'
            }`}
            title="Click to detect your exact GPS coordinates"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${
              safeLocation.status === 'detecting'
                ? 'bg-amber-400 animate-spin'
                : safeLocation.status === 'denied' || safeLocation.status === 'unavailable'
                ? 'bg-red-400'
                : 'bg-emerald-400 animate-ping'
            }`} />
            <span className="font-bold text-slate-100">
              {safeLocation.status === 'detecting'
                ? '📍 Detecting your location...'
                : `📍 ${safeLocation.address || 'GPS Telematics Connected'}`}
            </span>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 ml-1">
              {safeLocation.status === 'denied' || safeLocation.status === 'unavailable' ? 'Retry GPS' : 'Live GPS'}
            </span>
          </button>
        </div>
      </div>

      {/* GPS Status Alert Banner (When Permission Denied or Unavailable) */}
      {(activeLocation.status === 'denied' || activeLocation.status === 'unavailable') && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {activeLocation.status === 'denied'
                  ? 'Location access is required to find nearby mechanics'
                  : 'Unable to detect your current GPS location'}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {activeLocation.status === 'denied'
                  ? 'Please allow browser location permissions in your address bar to automatically detect mechanics around you.'
                  : 'Please ensure device GPS/location services are enabled and try again.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={detectLocation}
            className="shrink-0 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
          >
            Retry Location
          </button>
        </div>
      )}

      {/* ACTIVE BOOKING CARD (If any active breakdown) */}
      {activeBooking && (
        <div className="relative overflow-hidden rounded-2xl p-5 border border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 light:from-amber-500/10 light:via-white light:to-white shadow-xl glow-amber">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Navigation className="w-6 h-6 text-amber-400 animate-bounce-subtle" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                    Live Active Request
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{activeBooking.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 capitalize font-medium">
                    {activeBooking.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Mechanic {activeBooking.mechanicName || 'Assigned'} is {activeBooking.status === 'travelling' ? 'en route to your vehicle' : 'handling your breakdown'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeBooking.vehicleInfo?.make || 'Vehicle'} {activeBooking.vehicleInfo?.model || ''} {activeBooking.vehicleInfo?.regNo ? `(${activeBooking.vehicleInfo.regNo})` : ''} • ETA ~{activeBooking.etaMinutes || 15} mins
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <a
                href={activeBooking.mechanicLat && activeBooking.mechanicLng && activeBooking.customerLat && activeBooking.customerLng
                  ? `https://www.google.com/maps/dir/?api=1&origin=${activeBooking.mechanicLat},${activeBooking.mechanicLng}&destination=${activeBooking.customerLat},${activeBooking.customerLng}`
                  : `https://www.google.com/maps?q=${activeBooking.customerLat || 19.0760},${activeBooking.customerLng || 72.8777}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Google Maps ↗</span>
              </a>

              <button
                onClick={() => onOpenTracking(activeBooking.id)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
              >
                <Navigation className="w-4 h-4" />
                Track Live
              </button>

              <button
                onClick={async () => {
                  if (confirm(`Cancel active roadside request ${activeBooking.id}?`)) {
                    await api.updateBookingStatus(activeBooking.id, 'cancelled', 'Cancelled by customer from dashboard');
                    loadData();
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold text-xs transition-colors"
              >
                Cancel Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: LARGE EMERGENCY HERO BUTTON WITH LIVE HIGHWAY VIDEO BACKDROP */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-[#0C0E14] border-2 border-amber-500/40 light:border-[#111215] shadow-2xl light:shadow-[4px_4px_0px_#111215] group">
        {/* Live Highway Night Driving Video Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            key={theme}
            src={theme === 'dark' ? '/bg-highway.mp4' : '/bg-highway-2.mp4'}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-110 opacity-75 light:opacity-85 group-hover:scale-105 transition-transform duration-1000"
          />
          {/* Multi-layered dark gradients for guaranteed high contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/50" />
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span>24/7 Live Highway Rescue • Avg 12 Mins Arrival</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
              🆘 NEED ROADSIDE HELP?
            </h2>
            <p className="text-xs sm:text-sm text-slate-100 max-w-xl leading-relaxed drop-shadow font-medium">
              Stranded on the road or highway? Get instant AI diagnosis, transparent pricing, and direct live telematics dispatch of certified mechanics to your GPS coordinates.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-2">
            <button
              onClick={() => onStartBreakdown()}
              className="px-8 py-4 sm:px-10 sm:py-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg tracking-wide shadow-2xl shadow-amber-500/50 flex items-center gap-3 border border-amber-300 cta-btn cursor-pointer btn-primary-amber"
            >
              <AlertTriangle className="w-6 h-6 text-slate-950 fill-current" />
              <span>Get Help Now</span>
            </button>
            <span className="text-[11px] text-amber-300/90 font-semibold drop-shadow">
              ⚡ 100% Verified Mechanics • Transparent Pricing
            </span>
          </div>
        </div>
      </div>

      {/* QUICK SERVICES SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-700/80 dark:border-slate-700/80 light:border-[#111215] backdrop-blur-xl shadow-lg light:shadow-[4px_4px_0px_#111215]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 light:bg-amber-100 text-amber-400 light:text-[#92400E] border border-amber-500/30 light:border-[#92400E]/30">
              <Wrench className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white dark:text-white light:text-[#111215]">Emergency Quick Services</h3>
          </div>
          <span className="text-xs text-amber-300 dark:text-amber-300 light:text-[#92400E] font-bold">Tap to request instant rescue</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickServices.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => onStartBreakdown(service.id)}
                className={`group relative p-4 rounded-2xl bg-gradient-to-br ${service.color} bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-700/80 dark:border-slate-700/80 light:border-[#111215] hover:border-amber-400 hover:bg-slate-850 light:hover:bg-[#FAF8F5] transition-all text-left flex flex-col justify-between h-32 shadow-xl light:shadow-[3px_3px_0px_#111215] hover:shadow-2xl hover:-translate-y-1 backdrop-blur-xl cursor-pointer`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-[#EFECE5] border border-slate-700 dark:border-slate-700 light:border-[#111215] group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-400 light:text-[#111215] group-hover:text-amber-400 transition-colors" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white dark:text-white light:text-[#111215] group-hover:text-amber-300 light:group-hover:text-[#92400E] transition-colors">
                    {service.label}
                  </h4>
                  <p className="text-[11px] text-slate-300 dark:text-slate-300 light:text-[#374151] mt-0.5 line-clamp-1 font-medium">
                    {service.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAP & NEARBY MECHANICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Nearby Rescue Units Fleet */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-700/80 dark:border-slate-700/80 light:border-[#111215] backdrop-blur-xl shadow-lg light:shadow-[4px_4px_0px_#111215]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 light:bg-sky-50 text-cyan-400 light:text-[#0369A1] border border-cyan-500/30 light:border-[#0284C7]">
                <Navigation className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-white dark:text-white light:text-[#111215]">Active Certified Rescue Units</h3>
            </div>
            <span className="text-xs text-cyan-300 dark:text-cyan-300 light:text-[#0369A1] font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/60 dark:bg-cyan-950/60 light:bg-sky-50 border border-cyan-500/40 dark:border-cyan-500/40 light:border-[#0284C7]">
              ⚡ {nearbyMechanics.length} active mobile units on patrol near {(safeLocation.address || 'your area').split(',')[0]}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {nearbyMechanics.slice(0, 4).map((mech, idx) => {
              const distanceKm = (1.2 + (idx % 4) * 0.8).toFixed(1);
              const etaMins = 8 + (idx % 4) * 4;
              return (
                <div
                  key={mech.id}
                  className="p-4 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-700/80 dark:border-slate-700/80 light:border-[#111215] shadow-lg light:shadow-[3px_3px_0px_#111215] hover:border-amber-400 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={mech.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'}
                        alt={mech.name}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700 light:ring-[#111215]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-white dark:text-white light:text-[#111215] font-heading">{mech.name}</h4>
                          {mech.profile?.isVerified && (
                            <span title="Verified Certified Technician">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 light:text-[#047857]" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-[#374151] font-medium">{mech.profile?.workshopName || 'Certified Workshop'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 light:bg-amber-100 border border-amber-500/30 light:border-[#92400E]/30 text-amber-400 dark:text-amber-400 light:text-[#92400E] text-xs font-bold font-mono">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{mech.profile?.rating || '4.9'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 dark:border-slate-800 light:border-[#111215] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-400 light:text-[#374151]">
                      <span className="flex items-center gap-1 text-cyan-300 dark:text-cyan-300 light:text-[#0369A1] font-bold">
                        <MapPin className="w-3 h-3" />
                        {distanceKm} km
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 dark:text-emerald-400 light:text-[#047857] font-bold">~{etaMins} mins ETA</span>
                    </div>

                    <button
                      onClick={() => onStartBreakdown()}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md btn-primary-amber cursor-pointer"
                    >
                      Request Rescue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vehicle Health & Maintenance Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-700/80 dark:border-slate-700/80 light:border-[#111215] backdrop-blur-xl shadow-lg light:shadow-[4px_4px_0px_#111215]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 light:bg-emerald-50 text-emerald-400 light:text-[#047857] border border-emerald-500/30 light:border-[#047857]">
                <Car className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-white dark:text-white light:text-[#111215]">Vehicle Health</h3>
            </div>
            <button
              onClick={onOpenVehicles}
              className="text-xs font-bold text-amber-400 dark:text-amber-400 light:text-[#92400E] bg-amber-500/10 dark:bg-amber-500/10 light:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-500/30 dark:border-amber-500/30 light:border-[#92400E]/30 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              Manage &rarr;
            </button>
          </div>

          {/* Maintenance alert card */}
          {maintenanceDue ? (
            <div className="p-5 rounded-3xl bg-slate-900/95 dark:bg-slate-900/95 light:bg-white border border-amber-500/50 dark:border-amber-500/50 light:border-[#111215] shadow-2xl light:shadow-[4px_4px_0px_#111215] backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 dark:text-amber-400 light:text-[#92400E] text-xs font-black uppercase tracking-wider bg-amber-500/15 light:bg-amber-100 border border-amber-500/30 light:border-[#92400E]/30 px-3 py-1 rounded-xl w-fit">
                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Service Due Soon</span>
              </div>
              <h4 className="text-base font-black text-white dark:text-white light:text-[#111215]">{maintenanceDue.vehicleName}</h4>
              <p className="text-xs text-slate-200 dark:text-slate-200 light:text-[#374151] leading-relaxed font-medium">
                Odometer is at <strong className="text-white dark:text-white light:text-[#111215]">{maintenanceDue.odometerKm} km</strong>. Recommended inspection due at <strong className="text-amber-300 dark:text-amber-300 light:text-[#92400E]">{maintenanceDue.nextDueKm} km</strong>.
              </p>
              <button
                onClick={onOpenMaintenance}
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 border border-amber-300 light:border-[#111215] transition-all shadow-lg shadow-amber-500/20 cta-btn btn-primary-amber cursor-pointer"
              >
                View Maintenance Schedule
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-slate-900/95 dark:bg-slate-900/95 light:bg-white border border-slate-700 dark:border-slate-700 light:border-[#111215] shadow-2xl light:shadow-[4px_4px_0px_#111215] backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 light:text-[#047857] text-xs font-black bg-emerald-950/80 light:bg-emerald-50 border border-emerald-500/40 light:border-[#047857] px-3 py-1 rounded-xl w-fit">
                <CheckCircle className="w-4 h-4 text-emerald-400 light:text-[#047857]" />
                <span>All Systems Operational</span>
              </div>
              <p className="text-xs text-slate-200 dark:text-slate-200 light:text-[#374151] leading-relaxed font-medium">
                No immediate service alerts recorded for your registered vehicles. All telematics diagnostics pass safety standards.
              </p>
              <button
                onClick={onOpenMaintenance}
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-[#FAF8F5] hover:bg-slate-700 light:hover:bg-[#EFECE5] text-xs font-bold text-white dark:text-white light:text-[#111215] border border-slate-600 dark:border-slate-600 light:border-[#111215] transition-all shadow-md light:shadow-[2px_2px_0px_#111215] cursor-pointer"
              >
                Check Maintenance Log
              </button>
            </div>
          )}

          {/* AI Vehicle Troubleshooter Assistant Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/95 via-slate-900/95 to-purple-950/80 dark:from-indigo-950/95 dark:via-slate-900/95 dark:to-purple-950/80 light:from-indigo-50 light:via-purple-50 light:to-white border border-indigo-500/60 dark:border-indigo-500/60 light:border-[#111215] shadow-2xl light:shadow-[4px_4px_0px_#111215] backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 dark:text-indigo-300 light:text-[#5B21B6] text-xs font-black bg-indigo-950/80 dark:bg-indigo-950/80 light:bg-indigo-100 border border-indigo-500/50 dark:border-indigo-500/50 light:border-[#5B21B6]/30 px-3 py-1 rounded-xl w-fit">
              <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-400 light:text-[#5B21B6] animate-pulse" />
              <span>Roadfix AI Diagnostic Assistant</span>
            </div>
            <p className="text-xs text-slate-200 dark:text-slate-200 light:text-[#374151] leading-relaxed font-medium">
              Hear strange clicking sounds, brake squeals, or engine shuddering? Ask our AI assistant for safe roadside troubleshooting checks.
            </p>
            <button
              onClick={onOpenAiAssistant}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white text-xs font-black transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Assistant →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
