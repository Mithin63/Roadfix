import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Booking } from '../../types';
import {
  Clock,
  Car,
  FileText,
  Star,
  ChevronRight,
  Wrench,
  CheckCircle2,
  Calendar,
  DollarSign
} from 'lucide-react';

interface RepairHistoryViewProps {
  onViewInvoice: (bookingId: string) => void;
  onRateBooking: (bookingId: string) => void;
  onBack?: () => void;
}

export const RepairHistoryView: React.FC<RepairHistoryViewProps> = ({
  onViewInvoice,
  onRateBooking,
  onBack
}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<Booking | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      api.getBookings({ customerId: user.id })
        .then(res => {
          setBookings(res.bookings || []);
          if (res.bookings && res.bookings.length > 0) {
            setSelectedRecord(res.bookings[0]);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in text-left">
      {/* Top Back Navigation */}
      {onBack && (
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111A2E] hover:bg-[#1E2C48] text-slate-300 hover:text-white border border-[#1E2C48] text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <span>← Back to Dashboard</span>
          </button>
        </div>
      )}

      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-heading tracking-tight">Roadside Repair History</h2>
        <p className="text-xs text-slate-400">Complete record of roadside assistance incidents, digital invoices, and technician ratings</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 font-medium">Loading repair records telemetry...</div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111A2E] rounded-3xl border border-[#1E2C48]">
          No previous roadside service records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of records */}
          <div className="space-y-3 lg:col-span-1 max-h-[600px] overflow-y-auto pr-1">
            {bookings.map((b) => {
              const isSelected = selectedRecord?.id === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedRecord(b)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all text-left space-y-2.5 ${
                    isSelected
                      ? 'bg-[#FFB51B]/15 border-[#FFB51B] shadow-[0_0_20px_rgba(255,181,27,0.15)]'
                      : 'bg-[#111A2E] border-[#1E2C48] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#FFB51B]">
                      {b.id}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      b.status === 'payment_completed' ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-100 capitalize font-heading">
                      {b.problemType.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {b.vehicleInfo.make} {b.vehicleInfo.model} ({b.vehicleInfo.regNo})
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1E2C48]">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-black text-[#FFB51B] font-mono">
                      ₹{b.pricing.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Record Details View */}
          <div className="lg:col-span-2">
            {selectedRecord ? (
              <div className="p-6 rounded-3xl bg-[#111A2E] border border-[#1E2C48] space-y-5 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2C48] pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#FFB51B] bg-[#FFB51B]/10 border border-[#FFB51B]/20 px-2 py-0.5 rounded">
                      {selectedRecord.id}
                    </span>
                    <h3 className="text-lg font-black text-slate-100 mt-1.5 capitalize font-heading">
                      {selectedRecord.problemType.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Incident Date: {new Date(selectedRecord.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewInvoice(selectedRecord.id)}
                      className="px-3.5 py-2 rounded-xl bg-[#080D1C] hover:bg-[#17233D] text-xs font-bold text-slate-200 border border-[#1E2C48] flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
                      View Invoice
                    </button>
                    {selectedRecord.status === 'payment_completed' && (
                      <button
                        onClick={() => onRateBooking(selectedRecord.id)}
                        className="px-3.5 py-2 rounded-xl bg-[#FFB51B] hover:bg-[#FFD166] text-xs font-bold text-[#080D1C] flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,181,27,0.3)] active:scale-95"
                      >
                        <Star className="w-3.5 h-3.5 fill-[#080D1C]" />
                        Rate
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#080D1C] border border-[#1E2C48] space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                      Vehicle & Telematics
                    </span>
                    <p className="font-bold text-slate-100 text-sm font-heading">
                      {selectedRecord.vehicleInfo.make} {selectedRecord.vehicleInfo.model}
                    </p>
                    <p className="font-mono text-[#38BDF8]">{selectedRecord.vehicleInfo.regNo}</p>
                    <p className="text-slate-400">{selectedRecord.customerAddress}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#080D1C] border border-[#1E2C48] space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                      Assigned Mechanic
                    </span>
                    <div className="flex items-center gap-2.5">
                      <img
                        src={selectedRecord.mechanicAvatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'}
                        alt="Mechanic"
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#1E2C48]"
                      />
                      <div>
                        <p className="font-bold text-slate-100 font-heading">{selectedRecord.mechanicName || 'Certified Mechanic'}</p>
                        <p className="text-slate-400 font-mono text-[11px]">{selectedRecord.mechanicPhone || '+91 98205 77112'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work & Diagnosis */}
                <div className="p-4 rounded-2xl bg-[#080D1C] border border-[#1E2C48] space-y-2 text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                    Technical Work Performed
                  </span>
                  <p className="text-slate-200">
                    {selectedRecord.workPerformed || selectedRecord.aiDiagnosis.recommendedService}
                  </p>
                  {selectedRecord.mechanicDiagnosisNotes && (
                    <p className="text-slate-400 italic">
                      Mechanic Note: "{selectedRecord.mechanicDiagnosisNotes}"
                    </p>
                  )}
                </div>

                {/* Spare parts used */}
                {selectedRecord.spareParts && selectedRecord.spareParts.length > 0 && (
                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                      Spare Parts Replaced
                    </span>
                    <div className="border border-[#1E2C48] rounded-2xl overflow-hidden divide-y divide-[#1E2C48]">
                      {selectedRecord.spareParts.map((p, idx) => (
                        <div key={idx} className="p-3 flex justify-between bg-[#080D1C]/80">
                          <span className="text-slate-300">{p.name} (x{p.quantity})</span>
                          <span className="font-mono text-[#FFB51B] font-bold">₹{p.price * p.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cost Breakdown */}
                <div className="p-4 rounded-2xl bg-[#080D1C] border border-[#1E2C48] space-y-2 text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2">
                    Settled Cost Breakdown
                  </span>
                  <div className="flex justify-between text-slate-400">
                    <span>Base Service Callout:</span>
                    <span className="font-mono text-slate-300">₹{selectedRecord.pricing.baseService}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Travel & Dispatch:</span>
                    <span className="font-mono text-slate-300">₹{selectedRecord.pricing.travelCharge}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Technical Labour:</span>
                    <span className="font-mono text-slate-300">₹{selectedRecord.pricing.labour}</span>
                  </div>
                  {selectedRecord.pricing.parts > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Spare Parts:</span>
                      <span className="font-mono text-slate-300">₹{selectedRecord.pricing.parts}</span>
                    </div>
                  )}
                  <div className="pt-2.5 border-t border-[#1E2C48] flex justify-between font-black text-sm text-slate-100">
                    <span>Total Settled Bill:</span>
                    <span className="text-[#FFB51B] font-mono text-base font-extrabold">₹{selectedRecord.pricing.total}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
