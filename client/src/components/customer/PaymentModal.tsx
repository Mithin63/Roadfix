import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Booking, Invoice } from '../../types';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  QrCode,
  Wallet,
  Banknote,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  FileText,
  Copy,
  Check
} from 'lucide-react';

interface PaymentModalProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  bookingId,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'wallet' | 'cash'>('upi');
  const [upiId, setUpiId] = useState('rohan@okaxis');
  const [cardInfo, setCardInfo] = useState({ number: '4111 •••• •••• 8821', exp: '08/28', cvv: '•••' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (bookingId && isOpen) {
      setLoading(true);
      api.getBooking(bookingId)
        .then(res => {
          setBooking(res.booking);
          if (res.invoice) setInvoice(res.invoice);
          if (res.booking.status === 'payment_completed') {
            setPaymentSuccess(true);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [bookingId, isOpen]);

  if (!isOpen) return null;

  const handlePay = async () => {
    if (!booking || !user) return;
    setIsProcessing(true);

    try {
      const res = await api.processPayment({
        bookingId: booking.id,
        customerId: user.id,
        amount: booking.pricing.total,
        method: selectedMethod,
        upiId: selectedMethod === 'upi' ? upiId : undefined,
        cardLast4: selectedMethod === 'card' ? '8821' : undefined
      });

      setInvoice(res.invoice);
      setPaymentSuccess(true);

      // Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#080D1C]/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#111A2E] border border-[#1E2C48] rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2C48] bg-[#080D1C]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB51B]/15 border border-[#FFB51B]/30 flex items-center justify-center text-[#FFB51B]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#F1F5F9] font-heading">
                {paymentSuccess ? 'Digital Tax Invoice & Receipt' : 'Secure Roadside Settlement'}
              </h2>
              <p className="text-[11px] text-[#94A3B8] font-mono">
                Booking ID: {booking?.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2C48] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#94A3B8]">Loading invoice details...</div>
          ) : paymentSuccess && invoice ? (
            /* DIGITAL INVOICE RECEIPT VIEW */
            <div className="space-y-5 animate-in fade-in" id="printable-invoice">
              <div className="p-5 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center gap-3 text-[#10B981]">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="text-sm font-extrabold font-heading">Payment Successfully Settled</h4>
                  <p className="text-xs text-[#94A3B8]">
                    A digital copy has been recorded in your vehicle repair history.
                  </p>
                </div>
              </div>

              {/* Printable Invoice Sheet */}
              <div className="p-6 rounded-2xl bg-[#080D1C] border border-[#1E2C48] space-y-4 font-sans text-xs">
                <div className="flex justify-between items-start border-b border-[#1E2C48] pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#F1F5F9] font-heading">Roadfix</h3>
                    <p className="text-[11px] text-[#94A3B8]">24x7 Roadside Assistance Network</p>
                    <p className="text-[10px] text-[#64748B] mt-1">GSTIN: 27AABCR9912Q1Z4</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#FFB51B]">{invoice.invoiceNumber}</span>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">Date: {new Date(invoice.serviceDate).toLocaleDateString()}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-bold uppercase text-[10px]">
                      PAID • {invoice.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[#94A3B8] py-1">
                  <div>
                    <span className="text-[#64748B] text-[10px] uppercase font-bold block">Billed To</span>
                    <p className="font-semibold text-[#F1F5F9] mt-0.5">{invoice.customerName}</p>
                    <p className="text-[#94A3B8]">{invoice.customerPhone}</p>
                    <p className="text-[#94A3B8]">{invoice.vehicleInfo}</p>
                  </div>
                  <div>
                    <span className="text-[#64748B] text-[10px] uppercase font-bold block">Assigned Workshop</span>
                    <p className="font-semibold text-[#F1F5F9] mt-0.5">{invoice.mechanicWorkshop}</p>
                    <p className="text-[#94A3B8]">Technician: {invoice.mechanicName}</p>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="border border-[#1E2C48] rounded-xl overflow-hidden mt-3">
                  <table className="w-full text-left">
                    <thead className="bg-[#111A2E] text-[#94A3B8] font-bold text-[10px] uppercase border-b border-[#1E2C48]">
                      <tr>
                        <th className="p-2.5">Service / Component Item</th>
                        <th className="p-2.5 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2C48]">
                      {invoice.items.map((item, idx) => (
                        <tr key={idx} className="text-[#F1F5F9]">
                          <td className="p-2.5">{item.description}</td>
                          <td className="p-2.5 text-right font-mono font-medium">₹{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Taxes */}
                <div className="space-y-1.5 pt-2 border-t border-[#1E2C48] text-right">
                  <div className="flex justify-between text-[#94A3B8]">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{invoice.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-[#94A3B8]">
                    <span>GST (18% Statutory Rate):</span>
                    <span className="font-mono">₹{invoice.tax}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-[#F1F5F9] pt-1 border-t border-[#1E2C48]">
                    <span>Total Settled:</span>
                    <span className="text-[#FFB51B] font-mono">₹{invoice.total}</span>
                  </div>
                </div>
              </div>

              {/* Print / Download buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-[#1E2C48] hover:bg-[#2A3E66] text-[#F1F5F9] font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-[#FFB51B] hover:bg-[#FFD166] text-[#080D1C] font-extrabold text-xs btn-primary-amber"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* PAYMENT SELECTION FLOW */
            <div className="space-y-6">
              {/* Bill Overview */}
              <div className="p-4 rounded-2xl bg-[#080D1C] border border-[#1E2C48] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#FFB51B] tracking-wider font-heading">
                    Total Amount Due
                  </span>
                  <span className="text-2xl font-black text-[#F1F5F9] font-mono">
                    ₹{booking?.pricing.total}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-[#94A3B8] border-t border-[#1E2C48] pt-2">
                  <div className="flex justify-between">
                    <span>Base Callout Fee:</span>
                    <span className="font-mono">₹{booking?.pricing.baseService}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Travel & Dispatch:</span>
                    <span className="font-mono">₹{booking?.pricing.travelCharge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Technical Labour:</span>
                    <span className="font-mono">₹{booking?.pricing.labour}</span>
                  </div>
                  {booking?.pricing.parts ? (
                    <div className="flex justify-between">
                      <span>Parts Installed:</span>
                      <span className="font-mono">₹{booking.pricing.parts}</span>
                    </div>
                  ) : null}
                  {booking?.pricing.additionalCharges ? (
                    <div className="flex justify-between text-[#FFD166]">
                      <span>Approved Additional Charges:</span>
                      <span className="font-mono">₹{booking.pricing.additionalCharges}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] block font-heading">
                  Select Payment Gateway
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'upi', label: 'UPI / QR', icon: QrCode },
                    { id: 'card', label: 'Card', icon: CreditCard },
                    { id: 'wallet', label: 'Wallet', icon: Wallet },
                    { id: 'cash', label: 'Cash on Site', icon: Banknote },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id as any)}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#FFB51B]/20 border-[#FFB51B] text-[#FFD166] shadow-md'
                            : 'bg-[#080D1C] border-[#1E2C48] text-[#94A3B8] hover:text-[#F1F5F9]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-bold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Payment Method Fields */}
              {selectedMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-[#080D1C] border border-[#1E2C48] space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Simulated QR Code */}
                    <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                      <div className="w-full h-full border-4 border-slate-950 flex flex-col justify-between p-1">
                        <div className="flex justify-between">
                          <div className="w-4 h-4 bg-slate-950" />
                          <div className="w-4 h-4 bg-slate-950" />
                        </div>
                        <div className="text-[8px] text-center font-bold text-slate-950">
                          UPI QR
                        </div>
                        <div className="flex justify-between">
                          <div className="w-4 h-4 bg-slate-950" />
                          <div className="w-4 h-4 bg-slate-950" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 flex-1 w-full text-left">
                      <div className="text-xs text-[#94A3B8]">
                        Scan with <strong>Google Pay, PhonePe, Paytm, or BHIM</strong>, or enter VPA ID:
                      </div>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full px-3 py-2 rounded-xl bg-[#111A2E] border border-[#1E2C48] text-xs text-[#F1F5F9] field-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-[#080D1C] border border-[#1E2C48] space-y-3">
                  <div>
                    <label className="text-[11px] text-[#94A3B8]">Card Number</label>
                    <input
                      type="text"
                      value={cardInfo.number}
                      onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111A2E] border border-[#1E2C48] text-xs text-[#F1F5F9] font-mono field-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#94A3B8]">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardInfo.exp}
                        onChange={(e) => setCardInfo({ ...cardInfo, exp: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111A2E] border border-[#1E2C48] text-xs text-[#F1F5F9] field-input"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#94A3B8]">CVV</label>
                      <input
                        type="password"
                        value={cardInfo.cvv}
                        onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#111A2E] border border-[#1E2C48] text-xs text-[#F1F5F9] field-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'cash' && (
                <div className="p-4 rounded-2xl bg-[#080D1C] border border-[#1E2C48] text-xs text-[#94A3B8] space-y-1">
                  <p className="font-semibold text-[#F1F5F9]">Cash Settlement to Mechanic</p>
                  <p className="text-[#94A3B8]">
                    Hand ₹{booking?.pricing.total} cash directly to the mechanic after on-site testing. Mechanic will mark payment received on their device.
                  </p>
                </div>
              )}

              {/* Pay Button */}
              <button
                disabled={isProcessing}
                onClick={handlePay}
                className="w-full py-3.5 rounded-2xl bg-[#FFB51B] hover:bg-[#FFD166] text-[#080D1C] font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#FFB51B]/30 transition-transform hover:scale-[1.01] btn-primary-amber"
              >
                <ShieldCheck className="w-5 h-5 text-[#080D1C]" />
                <span>{isProcessing ? 'Authorizing Payment...' : `Complete Payment of ₹${booking?.pricing.total}`}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
