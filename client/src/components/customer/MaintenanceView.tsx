import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MaintenanceRecord, Vehicle } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Wrench,
  Gauge,
  Droplets,
  Disc,
  BatteryCharging
} from 'lucide-react';

interface MaintenanceViewProps {
  onBack?: () => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [newLog, setNewLog] = useState({
    vehicleId: '',
    serviceType: 'Oil & Filter Change',
    date: new Date().toISOString().split('T')[0],
    odometerKm: 20000,
    cost: 3500,
    notes: 'Engine oil 5W-40, oil filter, air filter cleaned',
    reminderMonths: 6
  });

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [maintRes, vehRes] = await Promise.all([
        api.getMaintenance(user.id),
        api.getVehicles(user.id)
      ]);
      setRecords(maintRes.records || []);
      setReminders(maintRes.reminders || []);
      setVehicles(vehRes.vehicles || []);
      if (vehRes.vehicles && vehRes.vehicles.length > 0 && !newLog.vehicleId) {
        setNewLog(prev => ({ ...prev, vehicleId: vehRes.vehicles[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newLog.vehicleId) return;
    try {
      await api.addMaintenanceRecord({
        ...newLog,
        customerId: user.id
      });
      setShowLogModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in text-left">
      {/* Top Back Navigation */}
      {onBack && (
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-colors shadow-md"
          >
            <span>← Back to Dashboard</span>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Vehicle Maintenance & Reminders</h2>
          <p className="text-xs text-slate-400">Track oil changes, battery health, tyre rotations, and scheduled service intervals</p>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Service Record</span>
        </button>
      </div>

      {/* Due Soon Reminders Banner */}
      {reminders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Automated Inspection Reminders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((r, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  r.isDueSoon
                    ? 'bg-amber-500/10 border-amber-500/40 glow-amber'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {r.vehicleName} ({r.regNo})
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    r.isDueSoon ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {r.isDueSoon ? 'Due Soon' : 'Upcoming'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Current Odometer</span>
                    <span className="font-mono font-bold">{r.odometerKm} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Next Target Due</span>
                    <span className="font-mono font-bold text-amber-400">{r.nextDueKm} km</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Recommended Inspection Checklist:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {r.recommendedChecks.map((chk: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        • {chk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routine Inspection Intervals Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Standard Maintenance Guidelines
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Droplets className="w-3.5 h-3.5" />
              <span>Synthetic Engine Oil</span>
            </div>
            <p className="text-slate-400 text-[11px]">Every 10,000 km or 12 months</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Disc className="w-3.5 h-3.5" />
              <span>Tyre Rotation & PSI</span>
            </div>
            <p className="text-slate-400 text-[11px]">Every 5,000 km / Monthly check</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>12V Battery SOH</span>
            </div>
            <p className="text-slate-400 text-[11px]">Inspect every 6 months</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <Wrench className="w-3.5 h-3.5" />
              <span>Brake Line & Fluid</span>
            </div>
            <p className="text-slate-400 text-[11px]">Flush every 24 months (DOT 4)</p>
          </div>
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 text-left space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">Log Vehicle Maintenance</h3>
            <form onSubmit={handleAddLog} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Vehicle</label>
                <select
                  value={newLog.vehicleId}
                  onChange={(e) => setNewLog({ ...newLog, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.regNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Service Type</label>
                <input
                  type="text"
                  value={newLog.serviceType}
                  onChange={(e) => setNewLog({ ...newLog, serviceType: e.target.value })}
                  placeholder="e.g. Engine Oil, Brake Pad Replacement, General Tune-up"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Odometer (km)</label>
                  <input
                    type="number"
                    value={newLog.odometerKm}
                    onChange={(e) => setNewLog({ ...newLog, odometerKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    value={newLog.cost}
                    onChange={(e) => setNewLog({ ...newLog, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Next Reminder Interval (Months)</label>
                <select
                  value={newLog.reminderMonths}
                  onChange={(e) => setNewLog({ ...newLog, reminderMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value={3}>Every 3 Months</option>
                  <option value={6}>Every 6 Months</option>
                  <option value={12}>Every 12 Months</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Notes & Workshop Details</label>
                <textarea
                  rows={2}
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 font-bold text-slate-950"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
