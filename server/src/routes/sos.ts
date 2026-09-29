import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { EmergencyContact } from '../types';

const router = Router();

// Get emergency contacts for customer
router.get('/contacts', (req: Request, res: Response) => {
  const customerId = (req.query.customerId as string) || (req.headers['x-user-id'] as string);
  if (!customerId) {
    return res.status(400).json({ success: false, message: 'customerId is required' });
  }

  const contacts = db.getEmergencyContacts(customerId);
  res.json({ success: true, contacts });
});

// Add emergency contact
router.post('/contacts', (req: Request, res: Response) => {
  const { customerId, name, phone, relationship } = req.body;

  if (!customerId || !name || !phone) {
    return res.status(400).json({ success: false, message: 'customerId, name, and phone are required' });
  }

  const newContact: EmergencyContact = {
    id: `ec-${Date.now()}`,
    customerId,
    name,
    phone,
    relationship: relationship || 'Family'
  };

  db.addEmergencyContact(newContact);
  res.status(201).json({ success: true, contact: newContact });
});

// Delete emergency contact
router.delete('/contacts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteEmergencyContact(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Contact not found' });
  }
  res.json({ success: true, message: 'Emergency contact removed' });
});

// Trigger SOS Alert
router.post('/trigger', (req: Request, res: Response) => {
  const { customerId, lat, lng, address } = req.body;

  if (!customerId) {
    return res.status(400).json({ success: false, message: 'customerId is required' });
  }

  const customer = db.getUser(customerId);
  const contacts = db.getEmergencyContacts(customerId);

  const googleMapsUrl = `https://www.google.com/maps?q=${lat || 19.0760},${lng || 72.8777}`;
  const alertPayload = {
    timestamp: new Date().toISOString(),
    customerName: customer?.name || 'Customer',
    phone: customer?.phone || 'Not specified',
    location: {
      lat: lat || 19.0760,
      lng: lng || 72.8777,
      address: address || 'Current GPS coordinates',
      mapsLink: googleMapsUrl
    },
    notifiedContactsCount: contacts.length,
    contactsNotified: contacts.map(c => ({
      name: c.name,
      phone: c.phone,
      simulatedSms: `EMERGENCY ALERT: ${customer?.name || 'Your contact'} has activated RoadRescue AI SOS. Location: ${address || 'GPS coords'} (${googleMapsUrl})`
    })),
    nearbyServices: [
      { name: 'National Emergency Helpline', phone: '112', type: 'Police / Highway Patrol' },
      { name: 'Highway Traffic Police (Toll Free)', phone: '1033', type: 'Road Incident Management' },
      { name: 'Ambulance Emergency Response', phone: '108', type: 'Medical' },
      { name: 'RoadRescue 24x7 Incident Control Room', phone: '+91 1800-RESCUE-AI', type: 'Roadside Tow & Recovery' }
    ],
    status: 'ACTIVE_EMERGENCY_TRACKING',
    disclaimer: 'Simulated SOS dispatch. For life-threatening emergencies, directly dial 112 or 108.'
  };

  // Add system notification for customer
  db.addNotification({
    id: `notif-${Date.now()}-sos`,
    userId: customerId,
    title: '🚨 SOS Emergency Broadcast Active',
    message: `Location shared with ${contacts.length} emergency contacts. Incident tracking initiated.`,
    type: 'emergency',
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({ success: true, sos: alertPayload });
});

export default router;
