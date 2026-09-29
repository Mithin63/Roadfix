import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { ChatMessage } from '../types';

const router = Router();

// Get chat messages for a booking
router.get('/:bookingId', (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const messages = db.getChatMessages(bookingId);
  res.json({ success: true, messages });
});

// Send a chat message
router.post('/:bookingId', (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { senderId, senderRole, text, imageUrl } = req.body;

  if (!senderId || !text) {
    return res.status(400).json({ success: false, message: 'senderId and text are required' });
  }

  const message: ChatMessage = {
    id: `msg-${Date.now()}`,
    bookingId,
    senderId,
    senderRole: senderRole || 'customer',
    text,
    imageUrl,
    timestamp: new Date().toISOString()
  };

  db.addChatMessage(bookingId, message);

  // If customer sent it, notify mechanic; if mechanic sent it, notify customer
  const booking = db.getBooking(bookingId);
  if (booking) {
    const recipientId = senderRole === 'customer' ? booking.mechanicId : booking.customerId;
    db.addNotification({
      id: `notif-${Date.now()}-chat`,
      userId: recipientId,
      title: `Message from ${senderRole === 'customer' ? booking.customerName : booking.mechanicName || 'Mechanic'} 💬`,
      message: text.length > 60 ? `${text.substring(0, 60)}...` : text,
      type: 'info',
      bookingId,
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  res.status(201).json({ success: true, message });
});

export default router;
