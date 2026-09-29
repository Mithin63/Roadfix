import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { Vehicle } from '../types';

const router = Router();

// Get vehicles for a customer
router.get('/', (req: Request, res: Response) => {
  const customerId = (req.query.customerId as string) || (req.headers['x-user-id'] as string);
  if (!customerId) {
    return res.status(400).json({ success: false, message: 'customerId is required' });
  }

  const vehicles = db.getVehiclesByCustomer(customerId);
  res.json({ success: true, vehicles });
});

// Add a new vehicle
router.post('/', (req: Request, res: Response) => {
  const { customerId, type, make, model, year, regNo, fuelType, color, odometerKm } = req.body;

  if (!customerId || !type || !make || !model || !regNo) {
    return res.status(400).json({ success: false, message: 'Missing required vehicle fields' });
  }

  const newVehicle: Vehicle = {
    id: `veh-${Date.now()}`,
    customerId,
    type,
    make,
    model,
    year: Number(year) || new Date().getFullYear(),
    regNo: regNo.toUpperCase().trim(),
    fuelType: fuelType || 'petrol',
    color: color || 'Silver',
    lastServiceDate: new Date().toISOString().split('T')[0],
    odometerKm: Number(odometerKm) || 10000
  };

  db.addVehicle(newVehicle);
  res.status(201).json({ success: true, vehicle: newVehicle });
});

// Delete vehicle
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteVehicle(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Vehicle not found' });
  }
  res.json({ success: true, message: 'Vehicle removed successfully' });
});

export default router;
