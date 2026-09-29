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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                {paymentSuccess ? 'Digital Tax Invoice & Receipt' : 'Secure Roadside Settlement'}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Booking ID: {booking?.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading invoice details...</div>
          ) : paymentSuccess && invoice ? (
            /* DIGITAL INVOICE RECEIPT VIEW */
            <div className="space-y-5 animate-in fade-in" id="printable-invoice">
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold">Payment Successfully Settled</h4>
                  <p className="text-xs text-slate-300">
                    A digital copy has been recorded in your vehicle repair history.
                  </p>
                </div>
              </div>

              {/* Printable Invoice Sheet */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-sans text-xs">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-black text-white">Roadfix</h3>
                    <p className="text-[11px] text-slate-400">24x7 Roadside Assistance Network</p>
                    <p className="text-[10px] text-slate-500 mt-1">GSTIN: 27AABCR9912Q1Z4</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-400">{invoice.invoiceNumber}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Date: {new Date(invoice.serviceDate).toLocaleDateString()}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase text-[10px]">
                      PAID • {invoice.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-slate-300 py-1">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Billed To</span>
                    <p className="font-semibold text-white mt-0.5">{invoice.customerName}</p>
                    <p className="text-slate-400">{invoice.customerPhone}</p>
                    <p className="text-slate-400">{invoice.vehicleInfo}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Assigned Workshop</span>
                    <p className="font-semibold text-white mt-0.5">{invoice.mechanicWorkshop}</p>
                    <p className="text-slate-400">Technician: {invoice.mechanicName}</p>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="border border-slate-800 rounded-xl overflow-hidden mt-3">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Service / Component Item</th>
                        <th className="p-2.5 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {invoice.items.map((item, idx) => (
                        <tr key={idx} className="text-slate-300">
                          <td className="p-2.5">{item.description}</td>
                          <td className="p-2.5 text-right font-mono font-medium">₹{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Taxes */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-right">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{invoice.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (18% Statutory Rate):</span>
                    <span className="font-mono">₹{invoice.tax}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-white pt-1 border-t border-slate-800">
                    <span>Total Settled:</span>
                    <span className="text-amber-400 font-mono">₹{invoice.total}</span>
                  </div>
                </div>
              </div>

              {/* Print / Download buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* PAYMENT SELECTION FLOW */
            <div className="space-y-6">
              {/* Bill Overview */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                    Total Amount Due
                  </span>
                  <span className="text-2xl font-black text-white font-mono">
                    ₹{booking?.pricing.total}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800 pt-2">
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
                    <div className="flex justify-between text-amber-300">
                      <span>Approved Additional Charges:</span>
                      <span className="font-mono">₹{booking.pricing.additionalCharges}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
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
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
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
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
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
                      <div className="text-xs text-slate-300">
                        Scan with <strong>Google Pay, PhonePe, Paytm, or BHIM</strong>, or enter VPA ID:
                      </div>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400">Card Number</label>
                    <input
                      type="text"
                      value={cardInfo.number}
                      onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardInfo.exp}
                        onChange={(e) => setCardInfo({ ...cardInfo, exp: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">CVV</label>
                      <input
                        type="password"
                        value={cardInfo.cvv}
                        onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'cash' && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">Cash Settlement to Mechanic</p>
                  <p className="text-slate-400">
                    Hand ₹{booking?.pricing.total} cash directly to the mechanic after on-site testing. Mechanic will mark payment received on their device.
                  </p>
                </div>
              )}

              {/* Pay Button */}
              <button
                disabled={isProcessing}
                onClick={handlePay}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition-transform hover:scale-[1.01]"
              >
                <ShieldCheck className="w-5 h-5 text-slate-950" />
                <span>{isProcessing ? 'Authorizing Payment...' : `Complete Payment of ₹${booking?.pricing.total}`}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
