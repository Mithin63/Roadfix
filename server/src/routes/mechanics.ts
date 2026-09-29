import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { findMatchingMechanics } from '../services/matchingService';
import { BreakdownProblem, VehicleCategory } from '../types';

const router = Router();

// Get all mechanics
router.get('/', (req: Request, res: Response) => {
  const { isOnline, vehicleType } = req.query;
  let list = db.getAllMechanics();

  if (isOnline === 'true') {
    list = list.filter(m => m.profile.isOnline);
  }

  if (vehicleType) {
    list = list.filter(m => m.profile.supportedVehicleTypes.includes(vehicleType as string));
  }

  res.json({ success: true, mechanics: list });
});

// Match mechanics based on customer position, vehicle type, problem, and equipment
router.post('/match', (req: Request, res: Response) => {
  const { customerLat, customerLng, vehicleType, problemType, requiredEquipment } = req.body;

  if (!customerLat || !customerLng || !vehicleType || !problemType) {
    return res.status(400).json({ success: false, message: 'Missing parameters for mechanic matching' });
  }

  const matches = findMatchingMechanics({
    customerLat: Number(customerLat),
    customerLng: Number(customerLng),
    vehicleType: vehicleType as VehicleCategory,
    problemType: problemType as BreakdownProblem,
    requiredEquipment: Array.isArray(requiredEquipment) ? requiredEquipment : []
  });

  res.json({ success: true, matches });
});

// Get mechanic by ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = db.getUser(id);
  const profile = db.getMechanicProfile(id);

  if (!user || !profile) {
    return res.status(404).json({ success: false, message: 'Mechanic not found' });
  }

  const reviews = db.getReviewsByMechanic(id);
  res.json({
    success: true,
    mechanic: {
      ...user,
      profile,
      reviews
    }
  });
});

// Update online status
router.put('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { isOnline, currentLat, currentLng } = req.body;

  const updates: any = {};
  if (typeof isOnline === 'boolean') updates.isOnline = isOnline;
  if (currentLat && currentLng) {
    updates.currentLat = Number(currentLat);
    updates.currentLng = Number(currentLng);
  }

  const updatedProfile = db.updateMechanicProfile(id, updates);
  if (!updatedProfile) {
    return res.status(404).json({ success: false, message: 'Mechanic profile not found' });
  }

  res.json({ success: true, profile: updatedProfile });
});

// Update equipment and skills
router.put('/:id/profile', (req: Request, res: Response) => {
  const { id } = req.params;
  const { workshopName, skills, equipment, supportedVehicleTypes, serviceRadiusKm, hourlyRate, baseServiceFee } = req.body;

  const updates: any = {};
  if (workshopName) updates.workshopName = workshopName;
  if (Array.isArray(skills)) updates.skills = skills;
  if (Array.isArray(equipment)) updates.equipment = equipment;
  if (Array.isArray(supportedVehicleTypes)) updates.supportedVehicleTypes = supportedVehicleTypes;
  if (serviceRadiusKm) updates.serviceRadiusKm = Number(serviceRadiusKm);
  if (hourlyRate) updates.hourlyRate = Number(hourlyRate);
  if (baseServiceFee) updates.baseServiceFee = Number(baseServiceFee);

  const updated = db.updateMechanicProfile(id, updates);
  res.json({ success: true, profile: updated });
});

export default router;
