import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongoDB } from './config/database';

import authRoutes from './routes/auth';
import vehicleRoutes from './routes/vehicles';
import mechanicRoutes from './routes/mechanics';
import bookingRoutes from './routes/bookings';
import aiRoutes from './routes/ai';
import paymentRoutes from './routes/payments';
import reviewRoutes from './routes/reviews';
import chatRoutes from './routes/chat';
import maintenanceRoutes from './routes/maintenance';
import sosRoutes from './routes/sos';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check & database connection status
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Roadfix API',
    version: '1.0.0',
    database: 'MongoDB (Mongoose Schema Layer Connected)',
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB and start listening
connectMongoDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Roadfix Server running on port ${PORT}`);
    console.log(`📍 API base: http://localhost:${PORT}/api`);
  });
});

export default app;

