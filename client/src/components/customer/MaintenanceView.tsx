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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111A2E] hover:bg-[#1E2C48] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#1E2C48] text-xs font-bold transition-colors shadow-md font-heading"
          >
            <span>← Back to Dashboard</span>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#F1F5F9] font-heading">Vehicle Maintenance & Reminders</h2>
          <p className="text-xs text-[#94A3B8]">Track oil changes, battery health, tyre rotations, and scheduled service intervals</p>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#FFB51B] hover:bg-[#FFD166] text-[#080D1C] font-extrabold text-xs flex items-center gap-1.5 shadow-md self-start sm:self-auto btn-primary-amber"
        >
          <Plus className="w-4 h-4" />
          <span>Log Service Record</span>
        </button>
      </div>

      {/* Due Soon Reminders Banner */}
      {reminders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFB51B] font-heading">
            Automated Inspection Reminders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((r, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  r.isDueSoon
                    ? 'bg-[#FFB51B]/10 border-[#FFB51B]/40'
                    : 'bg-[#111A2E] border-[#1E2C48]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#F1F5F9] flex items-center gap-1.5 font-heading">
                    <Clock className="w-3.5 h-3.5 text-[#FFB51B]" />
                    {r.vehicleName} ({r.regNo})
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    r.isDueSoon ? 'bg-[#FFB51B] text-[#080D1C]' : 'bg-[#080D1C] text-[#94A3B8] border border-[#1E2C48]'
                  }`}>
                    {r.isDueSoon ? 'Due Soon' : 'Upcoming'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#94A3B8]">
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase block font-heading">Current Odometer</span>
                    <span className="font-mono font-bold text-[#F1F5F9]">{r.odometerKm} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase block font-heading">Next Target Due</span>
                    <span className="font-mono font-bold text-[#FFB51B]">{r.nextDueKm} km</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-[#1E2C48]">
                  <span className="text-[10px] text-[#94A3B8] uppercase font-bold font-heading">Recommended Inspection Checklist:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {r.recommendedChecks.map((chk: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#080D1C] border border-[#1E2C48] text-[#94A3B8]">
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
      <div className="p-5 rounded-2xl bg-[#111A2E] border border-[#1E2C48] space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] font-heading">
          Standard Maintenance Guidelines
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#080D1C] border border-[#1E2C48] space-y-1">
            <div className="flex items-center gap-1.5 text-[#FFB51B] font-bold font-heading">
              <Droplets className="w-3.5 h-3.5" />
              <span>Synthetic Engine Oil</span>
            </div>
            <p className="text-[#94A3B8] text-[11px]">Every 10,000 km or 12 months</p>
          </div>
          <div className="p-3 rounded-xl bg-[#080D1C] border border-[#1E2C48] space-y-1">
            <div className="flex items-center gap-1.5 text-[#38BDF8] font-bold font-heading">
              <Disc className="w-3.5 h-3.5" />
              <span>Tyre Rotation & PSI</span>
            </div>
            <p className="text-[#94A3B8] text-[11px]">Every 5,000 km / Monthly check</p>
          </div>
          <div className="p-3 rounded-xl bg-[#080D1C] border border-[#1E2C48] space-y-1">
            <div className="flex items-center gap-1.5 text-[#FFD166] font-bold font-heading">
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>12V Battery SOH</span>
            </div>
            <p className="text-[#94A3B8] text-[11px]">Inspect every 6 months</p>
          </div>
          <div className="p-3 rounded-xl bg-[#080D1C] border border-[#1E2C48] space-y-1">
            <div className="flex items-center gap-1.5 text-red-400 font-bold font-heading">
              <Wrench className="w-3.5 h-3.5" />
              <span>Brake Line & Fluid</span>
            </div>
            <p className="text-[#94A3B8] text-[11px]">Flush every 24 months (DOT 4)</p>
          </div>
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D1C]/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#111A2E] border border-[#1E2C48] rounded-3xl p-6 text-left space-y-4 animate-in zoom-in-95 shadow-2xl">
            <h3 className="text-base font-extrabold text-[#F1F5F9] font-heading">Log Vehicle Maintenance</h3>
            <form onSubmit={handleAddLog} className="space-y-3 text-xs">
              <div>
                <label className="text-[#94A3B8] block mb-1">Select Vehicle</label>
                <select
                  value={newLog.vehicleId}
                  onChange={(e) => setNewLog({ ...newLog, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-[#F1F5F9] field-input"
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
                <label className="text-[#94A3B8] block mb-1">Service Type</label>
                <input
                  type="text"
                  value={newLog.serviceType}
                  onChange={(e) => setNewLog({ ...newLog, serviceType: e.target.value })}
                  placeholder="e.g. Engine Oil, Brake Pad Replacement, General Tune-up"
                  className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-[#F1F5F9] field-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94A3B8] block mb-1">Odometer (km)</label>
                  <input
                    type="number"
                    value={newLog.odometerKm}
                    onChange={(e) => setNewLog({ ...newLog, odometerKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-[#F1F5F9] field-input"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#94A3B8] block mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    value={newLog.cost}
                    onChange={(e) => setNewLog({ ...newLog, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-[#F1F5F9] field-input"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#94A3B8] block mb-1">Next Reminder Interval (Months)</label>
                <select
                  value={newLog.reminderMonths}
                  onChange={(e) => setNewLog({ ...newLog, reminderMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-[#F1F5F9] field-input"
                >
                  <option value={3}>Every 3 Months</option>
                  <option value={6}>Every 6 Months</option>
                  <option value={12}>Every 12 Months</option>
                </select>
              </div>

              <div>
                <label className="text-[#94A3B8] block mb-1">Notes & Workshop Details</label>
                <textarea
                  rows={2}
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-[#F1F5F9] field-input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#080D1C] hover:bg-[#1E2C48] text-[#94A3B8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFB51B] hover:bg-[#FFD166] font-extrabold text-[#080D1C] btn-primary-amber"
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
