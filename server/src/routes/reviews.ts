import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { Review } from '../types';

const router = Router();

// Get reviews
router.get('/', (req: Request, res: Response) => {
  const { mechanicId } = req.query;
  if (mechanicId) {
    const reviews = db.getReviewsByMechanic(mechanicId as string);
    return res.json({ success: true, reviews });
  }

  const reviews = db.getAllReviews();
  res.json({ success: true, reviews });
});

// Submit review
router.post('/', (req: Request, res: Response) => {
  const {
    bookingId,
    customerId,
    mechanicId,
    overallRating,
    responseTimeRating,
    professionalismRating,
    repairQualityRating,
    pricingTransparencyRating,
    comment
  } = req.body;

  if (!bookingId || !customerId || !mechanicId || !overallRating) {
    return res.status(400).json({ success: false, message: 'Missing required review fields' });
  }

  const customer = db.getUser(customerId);

  const review: Review = {
    id: `rev-${Date.now()}`,
    bookingId,
    customerId,
    customerName: customer?.name || 'Customer',
    customerAvatar: customer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    mechanicId,
    overallRating: Number(overallRating),
    responseTimeRating: Number(responseTimeRating) || Number(overallRating),
    professionalismRating: Number(professionalismRating) || Number(overallRating),
    repairQualityRating: Number(repairQualityRating) || Number(overallRating),
    pricingTransparencyRating: Number(pricingTransparencyRating) || Number(overallRating),
    comment: comment || 'Service completed successfully.',
    createdAt: new Date().toISOString()
  };

  db.addReview(review);

  // Notify mechanic
  db.addNotification({
    id: `notif-${Date.now()}-rev`,
    userId: mechanicId,
    title: 'New Service Rating Received! ⭐',
    message: `${review.customerName} gave you a ${overallRating}-star rating: "${review.comment}"`,
    type: 'success',
    bookingId,
    read: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ success: true, review });
});

export default router;
