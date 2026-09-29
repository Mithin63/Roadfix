import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { Payment } from '../types';

const router = Router();

// Process payment
router.post('/process', (req: Request, res: Response) => {
  const { bookingId, customerId, amount, method, upiId, cardLast4 } = req.body;

  if (!bookingId || !customerId || !amount || !method) {
    return res.status(400).json({ success: false, message: 'Missing required payment fields' });
  }

  const booking = db.getBooking(bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const paymentId = `pay_${Date.now()}`;
  const txRef = `RR-TXN-${Math.floor(100000 + Math.random() * 900000)}`;

  const payment: Payment = {
    id: paymentId,
    bookingId,
    customerId,
    mechanicId: booking.mechanicId,
    amount: Number(amount),
    method,
    upiId,
    cardLast4,
    transactionRef: txRef,
    status: 'success',
    paidAt: new Date().toISOString()
  };

  db.createPayment(payment);
  const invoice = db.getInvoiceByBookingId(bookingId);

  // Send notifications
  db.addNotification({
    id: `notif-${Date.now()}-c-pay`,
    userId: customerId,
    title: 'Payment Successful! 💳',
    message: `Payment of ₹${amount} for booking ${bookingId} was successful via ${method.toUpperCase()}. Invoice generated.`,
    type: 'success',
    bookingId,
    read: false,
    createdAt: new Date().toISOString()
  });

  db.addNotification({
    id: `notif-${Date.now()}-m-pay`,
    userId: booking.mechanicId,
    title: 'Customer Payment Received! 💰',
    message: `₹${amount} has been collected for booking ${bookingId}. Added to your earnings.`,
    type: 'success',
    bookingId,
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    payment,
    invoice
  });
});

// Get invoice by booking ID
router.get('/invoice/:bookingId', (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const invoice = db.getInvoiceByBookingId(bookingId);

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found for this booking' });
  }

  res.json({ success: true, invoice });
});

// Get all invoices (admin)
router.get('/invoices', (req: Request, res: Response) => {
  const invoices = db.getAllInvoices();
  res.json({ success: true, invoices });
});

export default router;
