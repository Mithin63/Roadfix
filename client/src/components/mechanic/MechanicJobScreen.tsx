import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Booking, BookingStatus, SparePart } from '../../types';
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
      <div className="py-20 text-center text-xs text-[#94A3B8]">Loading job details...</div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#111A2E] border border-[#1E2C48] shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#080D1C] hover:bg-[#1E2C48] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#FFB51B] bg-[#FFB51B]/10 px-2 py-0.5 rounded border border-[#FFB51B]/20">
                {booking.id}
              </span>
              <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-[#080D1C] text-[#94A3B8] border border-[#1E2C48] font-heading">
                {booking.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-[#F1F5F9] font-heading mt-1">
              {booking.customerName} • {booking.vehicleInfo.make} {booking.vehicleInfo.model}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${booking.mechanicLat || 19.0760},${booking.mechanicLng || 72.8777}&destination=${booking.customerLat},${booking.customerLng}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 text-[#38BDF8] border border-[#38BDF8]/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#FFB51B]" />
            <span>Open Google Maps ↗</span>
          </a>

          <button
            onClick={() => onOpenChat(booking.id)}
            className="px-3.5 py-2 rounded-xl bg-[#1E2C48] hover:bg-[#2A3E66] text-[#F1F5F9] border border-[#1E2C48] text-xs font-bold flex items-center gap-1.5 transition-colors"
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
      <div className="p-5 rounded-3xl bg-[#111A2E] border border-[#1E2C48] space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFB51B] font-heading">
          Job Status Progression Workflow
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleUpdateStatus('arrived', 'Mechanic has arrived at breakdown site')}
            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
              ['arrived', 'diagnosis_started', 'repair_in_progress', 'repair_completed', 'payment_completed'].includes(booking.status)
                ? 'bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]'
                : 'bg-[#080D1C] border-[#1E2C48] hover:border-[#FFB51B] text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            1. Arrived on Site
          </button>

          <button
            onClick={() => handleUpdateStatus('diagnosis_started', 'On-site physical and OBD2 diagnostics underway')}
            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
              ['diagnosis_started', 'repair_in_progress', 'repair_completed', 'payment_completed'].includes(booking.status)
                ? 'bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]'
                : 'bg-[#080D1C] border-[#1E2C48] hover:border-[#FFB51B] text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            2. Diagnosis Started
          </button>

          <button
            onClick={() => handleUpdateStatus('repair_in_progress', 'Roadside component replacement & repair in progress')}
            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
              ['repair_in_progress', 'repair_completed', 'payment_completed'].includes(booking.status)
                ? 'bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]'
                : 'bg-[#080D1C] border-[#1E2C48] hover:border-[#FFB51B] text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            3. Repair Started
          </button>

          <button
            onClick={() => handleUpdateStatus('repair_completed', 'Roadside repair successfully completed and verified')}
            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
              ['repair_completed', 'payment_completed'].includes(booking.status)
                ? 'bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]'
                : 'bg-[#FFB51B] hover:bg-[#FFD166] text-[#080D1C] font-extrabold btn-primary-amber'
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
          <div className="p-5 rounded-3xl bg-[#111A2E] border border-[#1E2C48] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] font-heading">
              Customer & Incident Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Customer Contact</span>
                <p className="font-extrabold text-[#F1F5F9] text-sm mt-0.5 font-heading">{booking.customerName}</p>
                <p className="text-[#FFB51B] font-mono font-medium">{booking.customerPhone}</p>
                <p className="text-[#94A3B8] mt-1">{booking.customerAddress}</p>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] uppercase font-bold block">Vehicle Specifications</span>
                <p className="font-extrabold text-[#F1F5F9] text-sm mt-0.5 font-heading">{booking.vehicleInfo.make} {booking.vehicleInfo.model}</p>
                <p className="font-mono text-[#38BDF8]">{booking.vehicleInfo.regNo}</p>
                <p className="text-[#94A3B8] mt-1 capitalize">Type: {booking.vehicleInfo.type} • Fuel: {booking.vehicleInfo.fuelType}</p>
              </div>
            </div>

            {/* Reported Problem & AI Assessment */}
            <div className="pt-3 border-t border-[#1E2C48] space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-[#FFB51B] font-heading">
                Customer Problem Description:
              </span>
              <p className="text-[#F1F5F9] bg-[#080D1C] p-3 rounded-xl border border-[#1E2C48]">
                "{booking.problemDescription}"
              </p>

              {booking.mediaUrls && booking.mediaUrls.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">Uploaded Photo/Video:</span>
                  <img src={booking.mediaUrls[0]} alt="Breakdown" className="w-48 h-32 object-cover rounded-xl border border-[#1E2C48]" />
                </div>
              )}
            </div>

            {/* Recommended Equipment Checklist */}
            <div className="pt-3 border-t border-[#1E2C48] space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] font-heading">
                AI Pre-Dispatched Equipment Checklist:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {booking.aiDiagnosis?.requiredEquipment.map((eq, i) => (
                  <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-[#080D1C] border border-[#1E2C48] text-[#FFD166] font-medium">
                    ✓ {eq}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mechanic Notes & Work Performed Form */}
          <div className="p-5 rounded-3xl bg-[#111A2E] border border-[#1E2C48] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] font-heading">
              On-Site Inspection & Diagnostic Log
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#94A3B8] block mb-1">Mechanic Diagnostic Findings</label>
                <textarea
                  rows={2}
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  placeholder="e.g. Battery tested 10.2V under cranking load, loose negative ground terminal..."
                  className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-[#F1F5F9] field-input"
                />
              </div>

              <div>
                <label className="text-[#94A3B8] block mb-1">Work Performed / Solution</label>
                <textarea
                  rows={2}
                  value={workPerformed}
                  onChange={(e) => setWorkPerformed(e.target.value)}
                  placeholder="e.g. Cleaned battery post with wire brush, performed jump start booster pack..."
                  className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-[#F1F5F9] field-input"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="w-48">
                  <label className="text-[#94A3B8] block mb-1">Labour Charge (₹)</label>
                  <input
                    type="number"
                    value={labourCharge}
                    onChange={(e) => setLabourCharge(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-[#F1F5F9] font-mono field-input"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveNotesAndLabour}
                  className="px-5 py-2 rounded-xl bg-[#FFB51B] hover:bg-[#FFD166] font-extrabold text-[#080D1C] text-xs self-end btn-primary-amber"
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
          <div className="p-5 rounded-3xl bg-[#111A2E] border border-[#1E2C48] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFB51B] font-heading">
              Spare Parts Installed ({booking.spareParts?.length || 0})
            </h3>

            {/* List of parts */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {booking.spareParts && booking.spareParts.length > 0 ? (
                booking.spareParts.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#080D1C] border border-[#1E2C48] flex justify-between text-xs">
                    <span className="text-[#F1F5F9]">{p.name} (x{p.quantity})</span>
                    <span className="font-mono text-[#FFB51B] font-bold">₹{p.price * p.quantity}</span>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-[#64748B] text-center py-2">No spare parts added yet.</div>
              )}
            </div>

            {/* Add Part Form */}
            <form onSubmit={handleAddSparePart} className="pt-2 border-t border-[#1E2C48] space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] block font-heading">+ Add Spare Part</span>
              <input
                type="text"
                placeholder="Part name (e.g. 15A Blade Fuse, Plug Strip)"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#080D1C] border border-[#1E2C48] text-[#F1F5F9] field-input"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Qty"
                  value={partQty}
                  onChange={(e) => setPartQty(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg bg-[#080D1C] border border-[#1E2C48] text-[#F1F5F9] font-mono field-input"
                  min={1}
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={partPrice || ''}
                  onChange={(e) => setPartPrice(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg bg-[#080D1C] border border-[#1E2C48] text-[#F1F5F9] font-mono field-input"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#1E2C48] hover:bg-[#2A3E66] text-[#FFD166] font-bold transition-colors"
              >
                Add Part to Bill
              </button>
            </form>
          </div>

          {/* Additional Charges Requiring Customer Approval (Section 10) */}
          <div className="p-5 rounded-3xl bg-[#111A2E] border border-[#1E2C48] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] font-heading">
                Additional Charges
              </h3>
              <button
                onClick={() => setShowAddCharge(!showAddCharge)}
                className="text-xs text-[#FFB51B] hover:text-[#FFD166] font-bold"
              >
                {showAddCharge ? 'Cancel' : '+ Request'}
              </button>
            </div>

            {/* List of additional charges */}
            <div className="space-y-1.5">
              {booking.additionalCharges && booking.additionalCharges.length > 0 ? (
                booking.additionalCharges.map((chg) => (
                  <div key={chg.id} className="p-2.5 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs flex justify-between items-center">
                    <div>
                      <div className="text-[#F1F5F9] font-medium">{chg.description}</div>
                      <div className="text-[10px] text-[#94A3B8] font-mono">₹{chg.amount}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      chg.approvedByCustomer
                        ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                        : 'bg-[#FFD166]/20 text-[#FFD166] border border-[#FFD166]/30'
                    }`}>
                      {chg.approvedByCustomer ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-[#64748B] text-center py-2">No additional charges requested.</div>
              )}
            </div>

            {showAddCharge && (
              <form onSubmit={handleRequestCharge} className="p-3 rounded-xl bg-[#080D1C] border border-[#1E2C48] space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Charge description (e.g. Broken valve stem replacement)"
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#111A2E] border border-[#1E2C48] text-[#F1F5F9] field-input"
                  required
                />
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={chargeAmount || ''}
                  onChange={(e) => setChargeAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#111A2E] border border-[#1E2C48] text-[#F1F5F9] font-mono field-input"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-[#FFB51B] hover:bg-[#FFD166] font-extrabold text-[#080D1C] btn-primary-amber"
                >
                  Send for Customer Approval
                </button>
              </form>
            )}
          </div>

          {/* Final Bill Summary */}
          <div className="p-5 rounded-3xl bg-[#080D1C] border border-[#1E2C48] space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8] font-bold uppercase tracking-wider text-[11px] font-heading">
                Final Total Bill
              </span>
              <span className="text-xl font-black text-[#FFB51B] font-mono">
                ₹{booking.pricing.total}
              </span>
            </div>

            <div className="space-y-1 text-[#94A3B8] border-t border-[#1E2C48] pt-2">
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
                <div className="flex justify-between text-[#FFD166]">
                  <span>Approved Add-ons:</span>
                  <span className="font-mono">₹{booking.pricing.additionalCharges}</span>
                </div>
              )}
            </div>

            {booking.status === 'repair_completed' && (
              <div className="p-2.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] font-bold text-center font-heading">
                Repair Completed — Waiting for Customer Payment
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
