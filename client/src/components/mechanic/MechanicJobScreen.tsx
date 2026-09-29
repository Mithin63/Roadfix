import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Booking, BookingStatus, SparePart } from '../../types';
import { MapLeaflet } from '../common/MapLeaflet';
import {
  Wrench,
  Navigation,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Plus,
  DollarSign,
  Car,
  MapPin,
  Clock,
  Sparkles,
  ChevronLeft,
  FileCheck
} from 'lucide-react';

interface MechanicJobScreenProps {
  bookingId: string;
  onBack: () => void;
  onOpenChat: (bookingId: string) => void;
}

export const MechanicJobScreen: React.FC<MechanicJobScreenProps> = ({
  bookingId,
  onBack,
  onOpenChat
}) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Mechanic inputs
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [labourCharge, setLabourCharge] = useState(250);

  // Spare parts input
  const [partName, setPartName] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [partPrice, setPartPrice] = useState(0);

  // Additional charge request
  const [showAddCharge, setShowAddCharge] = useState(false);
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState(0);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await api.getBooking(bookingId);
      setBooking(res.booking);
      setDiagnosisNotes(res.booking.mechanicDiagnosisNotes || '');
      setWorkPerformed(res.booking.workPerformed || '');
      setLabourCharge(res.booking.pricing.labour);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
    const interval = setInterval(fetchJob, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const handleUpdateStatus = async (newStatus: BookingStatus, note?: string) => {
    try {
      const res = await api.updateBookingStatus(bookingId, newStatus, note);
      setBooking(res.booking);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSparePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName || !partPrice) return;
    try {
      const res = await api.addSparePart(bookingId, {
        name: partName,
        quantity: partQty,
        price: partPrice
      });
      setBooking(res.booking);
      setPartName('');
      setPartPrice(0);
      setPartQty(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeDesc || !chargeAmount) return;
    try {
      const res = await api.requestAdditionalCharge(bookingId, chargeDesc, chargeAmount);
      setBooking(res.booking);
      setChargeDesc('');
      setChargeAmount(0);
      setShowAddCharge(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotesAndLabour = async () => {
    try {
      const res = await api.updatePricing(bookingId, {
        labour: labourCharge,
        workPerformed,
        mechanicDiagnosisNotes: diagnosisNotes
      });
      setBooking(res.booking);
      alert('Diagnostic notes and labour charge updated successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !booking) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">Loading job details...</div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                {booking.id}
              </span>
              <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {booking.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              {booking.customerName} • {booking.vehicleInfo.make} {booking.vehicleInfo.model}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${booking.mechanicLat || 19.0760},${booking.mechanicLng || 72.8777}&destination=${booking.customerLat},${booking.customerLng}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>Open Google Maps ↗</span>
          </a>

          <button
            onClick={() => onOpenChat(booking.id)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5"
          >
            <span>Chat</span>
          </button>

          {booking.status !== 'cancelled' && booking.status !== 'payment_completed' && (
            <button
              onClick={() => {
                if (confirm('Cancel this job? The customer will be alerted.')) {
                  handleUpdateStatus('cancelled', 'Cancelled by mechanic due to unforeseen technical constraint');
                }
              }}
              className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-colors"
            >
              Cancel Job
            </button>
          )}
        </div>
      </div>

      {/* STATUS CONTROLLER BUTTONS (Section 10) */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Job Status Progression Workflow
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleUpdateStatus('arrived', 'Mechanic has arrived at breakdown site')}
            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
              ['arrived', 'diagnosis_started', 'repair_in_progress', 'repair_completed', 'payment_completed'].includes(booking.status)
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-950 border-slate-700 hover:border-amber-500 text-slate-300'
            }`}
          >
            1. Arrived on Site
          </button>

          <button
            onClick={() => handleUpdateStatus('diagnosis_started', 'On-site physical and OBD2 diagnostics underway')}
            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
              ['diagnosis_started', 'repair_in_progress', 'repair_completed', 'payment_completed'].includes(booking.status)
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-950 border-slate-700 hover:border-amber-500 text-slate-300'
            }`}
          >
            2. Diagnosis Started
          </button>

          <button
            onClick={() => handleUpdateStatus('repair_in_progress', 'Roadside component replacement & repair in progress')}
            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
              ['repair_in_progress', 'repair_completed', 'payment_completed'].includes(booking.status)
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-950 border-slate-700 hover:border-amber-500 text-slate-300'
            }`}
          >
            3. Repair Started
          </button>

          <button
            onClick={() => handleUpdateStatus('repair_completed', 'Roadside repair successfully completed and verified')}
            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
              ['repair_completed', 'payment_completed'].includes(booking.status)
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-500 text-slate-950 font-black'
            }`}
          >
            4. Repair Completed
          </button>
        </div>
      </div>

      {/* Main Grid: Breakdown & Technical Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & AI Diagnosis */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer & Vehicle Info */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Customer & Incident Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Customer Contact</span>
                <p className="font-bold text-white text-sm mt-0.5">{booking.customerName}</p>
                <p className="text-amber-400 font-mono font-medium">{booking.customerPhone}</p>
                <p className="text-slate-400 mt-1">{booking.customerAddress}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Vehicle Specifications</span>
                <p className="font-bold text-white text-sm mt-0.5">{booking.vehicleInfo.make} {booking.vehicleInfo.model}</p>
                <p className="font-mono text-cyan-400">{booking.vehicleInfo.regNo}</p>
                <p className="text-slate-400 mt-1 capitalize">Type: {booking.vehicleInfo.type} • Fuel: {booking.vehicleInfo.fuelType}</p>
              </div>
            </div>

            {/* Reported Problem & AI Assessment */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-amber-400">
                Customer Problem Description:
              </span>
              <p className="text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800">
                "{booking.problemDescription}"
              </p>

              {booking.mediaUrls && booking.mediaUrls.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Uploaded Photo/Video:</span>
                  <img src={booking.mediaUrls[0]} alt="Breakdown" className="w-48 h-32 object-cover rounded-xl border border-slate-700" />
                </div>
              )}
            </div>

            {/* Recommended Equipment Checklist */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                AI Pre-Dispatched Equipment Checklist:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {booking.aiDiagnosis?.requiredEquipment.map((eq, i) => (
                  <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-medium">
                    ✓ {eq}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mechanic Notes & Work Performed Form */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              On-Site Inspection & Diagnostic Log
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Mechanic Diagnostic Findings</label>
                <textarea
                  rows={2}
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  placeholder="e.g. Battery tested 10.2V under cranking load, loose negative ground terminal..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Work Performed / Solution</label>
                <textarea
                  rows={2}
                  value={workPerformed}
                  onChange={(e) => setWorkPerformed(e.target.value)}
                  placeholder="e.g. Cleaned battery post with wire brush, performed jump start booster pack..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="w-48">
                  <label className="text-slate-400 block mb-1">Labour Charge (₹)</label>
                  <input
                    type="number"
                    value={labourCharge}
                    onChange={(e) => setLabourCharge(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveNotesAndLabour}
                  className="px-5 py-2 rounded-xl bg-amber-500 font-bold text-slate-950 text-xs self-end"
                >
                  Save Log
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Spare Parts, Additional Charges & Final Price */}
        <div className="space-y-5">
          {/* Spare Parts Section */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Spare Parts Installed ({booking.spareParts?.length || 0})
            </h3>

            {/* List of parts */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {booking.spareParts && booking.spareParts.length > 0 ? (
                booking.spareParts.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between text-xs">
                    <span className="text-slate-300">{p.name} (x{p.quantity})</span>
                    <span className="font-mono text-amber-400 font-bold">₹{p.price * p.quantity}</span>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-slate-500 text-center py-2">No spare parts added yet.</div>
              )}
            </div>

            {/* Add Part Form */}
            <form onSubmit={handleAddSparePart} className="pt-2 border-t border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">+ Add Spare Part</span>
              <input
                type="text"
                placeholder="Part name (e.g. 15A Blade Fuse, Plug Strip)"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Qty"
                  value={partQty}
                  onChange={(e) => setPartQty(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  min={1}
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={partPrice || ''}
                  onChange={(e) => setPartPrice(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold"
              >
                Add Part to Bill
              </button>
            </form>
          </div>

          {/* Additional Charges Requiring Customer Approval (Section 10) */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Additional Charges
              </h3>
              <button
                onClick={() => setShowAddCharge(!showAddCharge)}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold"
              >
                {showAddCharge ? 'Cancel' : '+ Request'}
              </button>
            </div>

            {/* List of additional charges */}
            <div className="space-y-1.5">
              {booking.additionalCharges && booking.additionalCharges.length > 0 ? (
                booking.additionalCharges.map((chg) => (
                  <div key={chg.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">{chg.description}</div>
                      <div className="text-[10px] text-slate-400 font-mono">₹{chg.amount}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      chg.approvedByCustomer
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {chg.approvedByCustomer ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-slate-500 text-center py-2">No additional charges requested.</div>
              )}
            </div>

            {showAddCharge && (
              <form onSubmit={handleRequestCharge} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Charge description (e.g. Broken valve stem replacement)"
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={chargeAmount || ''}
                  onChange={(e) => setChargeAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-amber-500 font-bold text-slate-950"
                >
                  Send for Customer Approval
                </button>
              </form>
            )}
          </div>

          {/* Final Bill Summary */}
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                Final Total Bill
              </span>
              <span className="text-xl font-black text-amber-400 font-mono">
                ₹{booking.pricing.total}
              </span>
            </div>

            <div className="space-y-1 text-slate-400 border-t border-slate-800 pt-2">
              <div className="flex justify-between">
                <span>Base Service:</span>
                <span className="font-mono">₹{booking.pricing.baseService}</span>
              </div>
              <div className="flex justify-between">
                <span>Travel Fee:</span>
                <span className="font-mono">₹{booking.pricing.travelCharge}</span>
              </div>
              <div className="flex justify-between">
                <span>Labour:</span>
                <span className="font-mono">₹{booking.pricing.labour}</span>
              </div>
              <div className="flex justify-between">
                <span>Spare Parts:</span>
                <span className="font-mono">₹{booking.pricing.parts}</span>
              </div>
              {booking.pricing.additionalCharges > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>Approved Add-ons:</span>
                  <span className="font-mono">₹{booking.pricing.additionalCharges}</span>
                </div>
              )}
            </div>

            {booking.status === 'repair_completed' && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-center">
                Repair Completed — Waiting for Customer Payment
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
