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
      {/* Welcome & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hello, {user?.name.split(' ')[0] || 'Driver'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            24/7 Roadside Assistance & Verified Mobile Mechanic Dispatch
          </p>
        </div>

        {/* Live Location display badge & Detect Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={detectLocation}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-xs text-slate-200 transition-colors shadow-md"
            title="Click to detect your exact GPS coordinates"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>📍 <strong>{activeLocation.address}</strong></span>
            <span className="text-[10px] text-amber-400 font-semibold underline ml-1">Refresh GPS</span>
          </button>
        </div>
      </div>

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

      {/* SECTION 3: LARGE EMERGENCY HERO BUTTON */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Immediate Response • Avg 12 Mins Arrival
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              🆘 NEED ROADSIDE HELP?
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Stranded with a breakdown? Get instant AI diagnosis, transparent price estimation, and automatic dispatch of verified mechanics with the right tools.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-2">
            <button
              onClick={() => onStartBreakdown()}
              className="px-8 py-4 sm:px-10 sm:py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-lg tracking-wide shadow-2xl shadow-amber-500/40 transform hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-amber-300"
            >
              <AlertTriangle className="w-6 h-6 text-slate-950 fill-current" />
              <span>Get Help Now</span>
            </button>
            <span className="text-[11px] text-slate-400 font-medium">
              100% Verified Mechanics • Transparent Pricing
            </span>
          </div>
        </div>
      </div>

      {/* QUICK SERVICES SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">Quick Services</h3>
          </div>
          <span className="text-xs text-slate-400">Tap to report directly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickServices.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => onStartBreakdown(service.id)}
                className={`group relative p-4 rounded-2xl bg-gradient-to-br ${service.color} bg-slate-900/60 border hover:border-amber-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between h-32 shadow-md hover:shadow-lg hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors">
                    {service.label}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Nearby Mechanics Radar</h3>
            </div>
            <span className="text-xs text-slate-400">
              {nearbyMechanics.length} active mobile units in Mumbai
            </span>
          </div>

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

        {/* Vehicle Health & Maintenance Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Vehicle Health</h3>
            </div>
            <button
              onClick={onOpenVehicles}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              Manage &rarr;
            </button>
          </div>

          {/* Maintenance alert card */}
          {maintenanceDue ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                Service Due Soon
              </div>
              <h4 className="text-sm font-bold text-white">{maintenanceDue.vehicleName}</h4>
              <p className="text-xs text-slate-300">
                Odometer is at {maintenanceDue.odometerKm} km. Recommended inspection due at {maintenanceDue.nextDueKm} km.
              </p>
              <button
                onClick={onOpenMaintenance}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 transition-colors"
              >
                View Maintenance Schedule
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle className="w-3.5 h-3.5" />
                All Systems Normal
              </div>
              <p className="text-xs text-slate-400">
                No immediate service warnings recorded for your active vehicles.
              </p>
              <button
                onClick={onOpenMaintenance}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
              >
                Check Maintenance Log
              </button>
            </div>
          )}

          {/* AI Vehicle Troubleshooter Assistant Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              Roadfix AI Diagnostic Assistant
            </div>
            <p className="text-xs text-slate-300">
              Hear strange clicking sounds or engine shuddering? Ask our AI assistant for safe roadside checks.
            </p>
            <button
              onClick={onOpenAiAssistant}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              Ask AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
