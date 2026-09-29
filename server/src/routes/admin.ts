import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { PROBLEM_CATALOG } from '../data/seeds';

const router = Router();

// Platform analytics and overview stats
router.get('/stats', (req: Request, res: Response) => {
  const allUsers = db.getAllUsers();
  const customers = allUsers.filter(u => u.role === 'customer');
  const mechanics = db.getAllMechanics();
  const bookings = db.getAllBookings();

  const activeRequests = bookings.filter(b =>
    !['repair_completed', 'payment_completed', 'cancelled'].includes(b.status)
  ).length;

  const completedRepairs = bookings.filter(b =>
    ['repair_completed', 'payment_completed'].includes(b.status)
  ).length;

  const totalRevenue = bookings
    .filter(b => b.status === 'payment_completed')
    .reduce((sum, b) => sum + (b.pricing.total || 0), 0);

  const reviews = db.getAllReviews();
  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length) * 10) / 10
    : 4.8;

  // Problem categories breakdown
  const categoryCounts: Record<string, number> = {};
  bookings.forEach(b => {
    categoryCounts[b.problemType] = (categoryCounts[b.problemType] || 0) + 1;
  });

  const problemBreakdown = Object.entries(categoryCounts).map(([type, count]) => ({
    type,
    label: PROBLEM_CATALOG.find(p => p.id === type)?.label || type.replace(/_/g, ' '),
    count
  }));

  // Daily bookings trend (last 7 days simulated)
  const dailyBookings = [
    { date: '19 Sep', count: 12, revenue: 14200 },
    { date: '20 Sep', count: 18, revenue: 21600 },
    { date: '21 Sep', count: 15, revenue: 18400 },
    { date: '22 Sep', count: 22, revenue: 27900 },
    { date: '23 Sep', count: 19, revenue: 23100 },
    { date: '24 Sep', count: 26, revenue: 32500 },
    { date: '25 Sep', count: 31, revenue: 39800 }
  ];

  res.json({
    success: true,
    stats: {
      totalCustomers: customers.length,
      totalMechanics: mechanics.length,
      activeRequests,
      completedRepairs,
      totalRevenue,
      averageRating: avgRating,
      onlineMechanics: mechanics.filter(m => m.profile.isOnline).length,
      verifiedMechanics: mechanics.filter(m => m.profile.isVerified).length,
      problemBreakdown,
      dailyBookings
    }
  });
});

// Users management
router.get('/users', (req: Request, res: Response) => {
  const users = db.getAllUsers();
  res.json({ success: true, users });
});

// Toggle block status
router.patch('/users/:id/block', (req: Request, res: Response) => {
  const { id } = req.params;
  const { isBlocked } = req.body;

  const updated = db.updateUser(id, { isBlocked: Boolean(isBlocked) });
  if (!updated) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({ success: true, user: updated });
});

// Verify or reject mechanic
router.patch('/mechanics/:id/verify', (req: Request, res: Response) => {
  const { id } = req.params;
  const { isVerified, status } = req.body;

  const profile = db.getMechanicProfile(id);
  if (!profile) {
    return res.status(404).json({ success: false, message: 'Mechanic profile not found' });
  }

  const updated = db.updateMechanicProfile(id, {
    isVerified: Boolean(isVerified),
    verificationDocs: {
      ...profile.verificationDocs,
      status: status || (isVerified ? 'verified' : 'rejected')
    }
  });

  // Notify mechanic
  db.addNotification({
    id: `notif-${Date.now()}-verify`,
    userId: id,
    title: isVerified ? 'Account Verified! ✅' : 'Verification Update ⚠️',
    message: isVerified
      ? 'Congratulations! Your mechanic profile and credentials have been verified by administration. You now carry the Verified Mechanic badge.'
      : 'Your verification submission was rejected or needs additional document uploads.',
    type: isVerified ? 'success' : 'warning',
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({ success: true, profile: updated });
});

// Complaints management
router.get('/complaints', (req: Request, res: Response) => {
  const complaints = db.getAllComplaints();
  res.json({ success: true, complaints });
});

router.patch('/complaints/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, resolutionNote } = req.body;

  const updated = db.updateComplaintStatus(id, status, resolutionNote);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  res.json({ success: true, complaint: updated });
});

// Problem catalog & pricing
let currentCatalog = [...PROBLEM_CATALOG];

router.get('/pricing-catalog', (req: Request, res: Response) => {
  res.json({ success: true, catalog: currentCatalog });
});

router.put('/pricing-catalog/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { basePrice, labourEst, timeEstMinutes } = req.body;

  const item = currentCatalog.find(p => p.id === id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Catalog item not found' });
  }

  if (basePrice !== undefined) item.basePrice = Number(basePrice);
  if (labourEst !== undefined) item.labourEst = Number(labourEst);
  if (timeEstMinutes !== undefined) item.timeEstMinutes = Number(timeEstMinutes);

  res.json({ success: true, item });
});

export default router;
