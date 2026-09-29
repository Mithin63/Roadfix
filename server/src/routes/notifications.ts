import { Router, Request, Response } from 'express';
import { db } from '../services/db';

const router = Router();

// Get notifications for user
router.get('/', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  const notifications = db.getNotificationsByUser(userId);
  const unreadCount = notifications.filter(n => !n.read).length;

  res.json({ success: true, notifications, unreadCount });
});

// Mark notification as read
router.patch('/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.markNotificationAsRead(id);
  res.json({ success: true, updated });
});

export default router;
