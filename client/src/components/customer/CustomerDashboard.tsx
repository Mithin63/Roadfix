import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Booking, BreakdownProblem } from '../../types';
import { MapLeaflet } from '../common/MapLeaflet';
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
  Flame
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
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [nearbyMechanics, setNearbyMechanics] = useState<any[]>([]);
  const [maintenanceDue, setMaintenanceDue] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const quickServices: { id: BreakdownProblem; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'battery_dead', label: 'Battery Problem', icon: BatteryCharging, color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400', desc: 'Jump start & battery testing' },
    { id: 'flat_tyre', label: 'Flat Tyre', icon: Disc, color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400', desc: 'Puncture repair & spare mount' },
    { id: 'fuel_problem', label: 'Fuel Problem', icon: Fuel, color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400', desc: 'Emergency 5L fuel delivery' },
    { id: 'engine_problem', label: 'Engine Problem', icon: Cpu, color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400', desc: 'Stalling, noise & diagnostics' },
    { id: 'overheating', label: 'Overheating', icon: Flame, color: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400', desc: 'Coolant leaks & steam' },
    { id: 'electrical_problem', label: 'Electrical / Fuse', icon: Zap, color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400', desc: 'Lights, harness & fuses' },
    { id: 'accident_damage', label: 'Accident / Damage', icon: ShieldAlert, color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400', desc: 'Body securing & clearance' },
    { id: 'key_lock_problem', label: 'Key / Lockout', icon: Key, color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400', desc: 'Lockout & key fob battery' },
    { id: 'other', label: 'Other Issue', icon: Wrench, color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400', desc: 'Brakes, clutch & towing prep' },
  ];

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Fetch bookings for this customer
      const bookingsRes = await api.getBookings({ customerId: user.id });
      const current = bookingsRes.bookings.find(
        b => !['payment_completed', 'cancelled'].includes(b.status)
      );
      setActiveBooking(current || null);

      // Fetch nearby mechanics
      const mechRes = await api.getMechanics({ isOnline: true });
      setNearbyMechanics(mechRes.mechanics || []);

      // Fetch maintenance
      const maintRes = await api.getMaintenance(user.id);
      const due = maintRes.reminders?.find((r: any) => r.isDueSoon);
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

  // Project mechanics in radius around customer's active location (in AP / current GPS)
  const mapNearbyPoints = nearbyMechanics.map((m, idx) => {
    // Generate realistic radius offsets around user's active coordinates (1.2km to 4.5km)
    const angle = (idx / (nearbyMechanics.length || 8)) * 2 * Math.PI;
    const distanceKm = 1.2 + (idx % 4) * 0.8;
    const latOffset = (distanceKm / 111) * Math.cos(angle);
    const lngOffset = (distanceKm / (111 * Math.cos((activeLocation.lat * Math.PI) / 180))) * Math.sin(angle);

    return {
      lat: activeLocation.lat + latOffset,
      lng: activeLocation.lng + lngOffset,
      title: `${m.name} (${m.profile.workshopName})`,
      subtitle: `Rating: ${m.profile.rating}★ • ${distanceKm.toFixed(1)} km away • ${m.phone}`,
      type: 'nearby' as const
    };
  });

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
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Hello,</span>
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent">
              {user?.name.split(' ')[0] || 'Driver'}
            </span>
            <span>👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
            24/7 Emergency Breakdown Assistance, Certified Mechanics & Smart Telematics
          </p>
        </div>

        {/* Live Location display badge & Detect Button */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={detectLocation}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border transition-all shadow-lg text-xs font-semibold ${
              activeLocation.status === 'denied' || activeLocation.status === 'unavailable'
                ? 'border-red-500/60 text-red-300'
                : 'border-amber-500/40 hover:border-amber-400 text-white'
            }`}
            title="Click to detect your exact GPS coordinates"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${
              activeLocation.status === 'detecting'
                ? 'bg-amber-400 animate-spin'
                : activeLocation.status === 'denied' || activeLocation.status === 'unavailable'
                ? 'bg-red-400'
                : 'bg-emerald-400 animate-ping'
            }`} />
            <span className="font-bold text-slate-100">
              {activeLocation.status === 'detecting'
                ? '📍 Detecting your location...'
                : `📍 ${activeLocation.address}`}
            </span>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 ml-1">
              {activeLocation.status === 'denied' || activeLocation.status === 'unavailable' ? 'Retry GPS' : 'Live GPS'}
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
        <div className="relative overflow-hidden rounded-2xl p-5 border border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 shadow-xl glow-amber">
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
                  {activeBooking.vehicleInfo.make} {activeBooking.vehicleInfo.model} ({activeBooking.vehicleInfo.regNo}) • ETA ~{activeBooking.etaMinutes} mins
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <a
                href={activeBooking.mechanicLat && activeBooking.mechanicLng
                  ? `https://www.google.com/maps/dir/?api=1&origin=${activeBooking.mechanicLat},${activeBooking.mechanicLng}&destination=${activeBooking.customerLat},${activeBooking.customerLng}`
                  : `https://www.google.com/maps?q=${activeBooking.customerLat},${activeBooking.customerLng}`}
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
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl group">
        {/* Live Highway Night Driving Video Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            src="/bg-highway.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-110 opacity-70 group-hover:scale-105 transition-transform duration-1000"
          />
          {/* Multi-layered glassmorphic dark gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40" />
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
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed drop-shadow">
              Stranded on the road or highway? Get instant AI diagnosis, transparent pricing, and direct live telematics dispatch of certified mechanics to your GPS coordinates.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-2">
            <button
              onClick={() => onStartBreakdown()}
              className="px-8 py-4 sm:px-10 sm:py-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg tracking-wide shadow-2xl shadow-amber-500/50 flex items-center gap-3 border border-amber-300 cta-btn cursor-pointer"
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
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Wrench className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">Emergency Quick Services</h3>
          </div>
          <span className="text-xs text-amber-300 font-semibold">Tap to request instant rescue</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickServices.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => onStartBreakdown(service.id)}
                className={`group relative p-4 rounded-2xl bg-gradient-to-br ${service.color} bg-slate-900/90 border border-slate-700/80 hover:border-amber-400 hover:bg-slate-850 transition-all text-left flex flex-col justify-between h-32 shadow-xl hover:shadow-2xl hover:-translate-y-1 backdrop-blur-xl`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-700 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors">
                    {service.label}
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1 font-medium">
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
        {/* Map Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Navigation className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-white">Nearby Mechanics Radar</h3>
            </div>
            <span className="text-xs text-cyan-300 font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40">
              ⚡ {nearbyMechanics.length} active mobile units near {activeLocation.address.split(',')[0] || 'your area'}
            </span>
          </div>

          <div className="rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl">
            <MapLeaflet
              center={[activeLocation.lat, activeLocation.lng]}
              zoom={13}
              customerPoint={{
                lat: activeLocation.lat,
                lng: activeLocation.lng,
                title: user?.name || 'Customer Location',
                subtitle: activeLocation.address,
                type: 'customer'
              }}
              nearbyPoints={mapNearbyPoints}
              height="320px"
            />
          </div>
        </div>

        {/* Vehicle Health & Maintenance Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Car className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-white">Vehicle Health</h3>
            </div>
            <button
              onClick={onOpenVehicles}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 hover:bg-amber-500/20 transition-all"
            >
              Manage &rarr;
            </button>
          </div>

          {/* Maintenance alert card */}
          {maintenanceDue ? (
            <div className="p-5 rounded-3xl bg-slate-900/95 border border-amber-500/50 shadow-2xl backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-xl w-fit">
                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Service Due Soon</span>
              </div>
              <h4 className="text-base font-black text-white">{maintenanceDue.vehicleName}</h4>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Odometer is at <strong className="text-white">{maintenanceDue.odometerKm} km</strong>. Recommended inspection due at <strong className="text-amber-300">{maintenanceDue.nextDueKm} km</strong>.
              </p>
              <button
                onClick={onOpenMaintenance}
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 border border-amber-300 transition-all shadow-lg shadow-amber-500/20 cta-btn"
              >
                View Maintenance Schedule
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-xl w-fit">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>All Systems Operational</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                No immediate service alerts recorded for your registered vehicles. All telematics diagnostics pass safety standards.
              </p>
              <button
                onClick={onOpenMaintenance}
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-600 transition-all shadow-md hover:border-amber-400"
              >
                Check Maintenance Log
              </button>
            </div>
          )}

          {/* AI Vehicle Troubleshooter Assistant Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/95 via-slate-900/95 to-purple-950/80 border border-indigo-500/60 shadow-2xl backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-black bg-indigo-950/80 border border-indigo-500/50 px-3 py-1 rounded-xl w-fit">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Roadfix AI Diagnostic Assistant</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              Hear strange clicking sounds, brake squeals, or engine shuddering? Ask our AI assistant for safe roadside troubleshooting checks.
            </p>
            <button
              onClick={onOpenAiAssistant}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white text-xs font-black transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
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
