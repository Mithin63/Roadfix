import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { MaintenanceRecord } from '../types';

const router = Router();

// Get maintenance records for a customer
router.get('/', (req: Request, res: Response) => {
  const customerId = (req.query.customerId as string) || (req.headers['x-user-id'] as string);
  if (!customerId) {
    return res.status(400).json({ success: false, message: 'customerId is required' });
  }

  const records = db.getMaintenanceByCustomer(customerId);
  const vehicles = db.getVehiclesByCustomer(customerId);

  // Generate reminders based on odometer and dates
  const reminders = vehicles.map(v => {
    const vRecords = records.filter(r => r.vehicleId === v.id);
    const lastRecord = vRecords[vRecords.length - 1];

    const nextKm = (v.odometerKm || 10000) + 5000;
    const isDueSoon = (v.odometerKm || 0) >= (lastRecord?.nextDueKm || 0) - 500;

    return {
      vehicleId: v.id,
      vehicleName: `${v.make} ${v.model}`,
      regNo: v.regNo,
      odometerKm: v.odometerKm,
      lastServiceDate: v.lastServiceDate || lastRecord?.date,
      nextDueKm: lastRecord?.nextDueKm || nextKm,
      nextDueDate: lastRecord?.nextDueDate || '2026-11-30',
      isDueSoon,
      recommendedChecks: ['Engine Oil & Filter', 'Brake Pad Thickness', 'Tyre Tread Depth & PSI', 'Battery Voltage SOH']
    };
  });

  res.json({ success: true, records, reminders });
});

// Add maintenance record
router.post('/', (req: Request, res: Response) => {
  const { customerId, vehicleId, serviceType, date, odometerKm, cost, notes, reminderMonths } = req.body;

  if (!customerId || !vehicleId || !serviceType || !odometerKm) {
    return res.status(400).json({ success: false, message: 'Missing required maintenance record fields' });
  }

  const months = Number(reminderMonths) || 6;
  const dueDate = new Date();
  dueDate.setMonth(dueDate.getMonth() + months);

  const newRecord: MaintenanceRecord = {
    id: `maint-${Date.now()}`,
    customerId,
    vehicleId,
    serviceType,
    date: date || new Date().toISOString().split('T')[0],
    odometerKm: Number(odometerKm),
    cost: Number(cost) || 0,
    notes: notes || '',
    reminderMonths: months,
    nextDueKm: Number(odometerKm) + 10000,
    nextDueDate: dueDate.toISOString().split('T')[0]
  };

  db.addMaintenanceRecord(newRecord);

  // Update vehicle lastServiceDate and odometer
  const vehicle = db.getVehicle(vehicleId);
  if (vehicle) {
    vehicle.lastServiceDate = newRecord.date;
    vehicle.odometerKm = newRecord.odometerKm;
  }

  res.status(201).json({ success: true, record: newRecord });
});

export default router;
