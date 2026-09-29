import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { User } from '../types';

const router = Router();

// Demo users endpoint disabled - direct demo logins are not permitted
router.get('/demo-users', (_req: Request, res: Response) => {
  res.status(403).json({
    success: false,
    message: 'Direct demo logins are disabled. Only registered accounts in the database can sign in.'
  });
});

// Login - Authenticates against registered users in the database
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  if (!password || !password.trim()) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  const user = db.getUserByEmail(email.trim());
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'No registered user found with this email. Please register your account first.'
    });
  }

  if (user.isBlocked) {
    return res.status(403).json({
      success: false,
      message: 'This account has been suspended by administration.'
    });
  }

  // Verify password against stored password in backend database
  const expectedPassword = user.password || 'password123';
  if (password.trim() !== expectedPassword) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password. Please enter the password you registered with.'
    });
  }

  let profile = undefined;
  if (user.role === 'mechanic') {
    profile = db.getMechanicProfile(user.id);
  }

  res.json({
    success: true,
    token: `roadfix-jwt-${user.id}-${Date.now()}`,
    user: {
      ...user,
      profile
    }
  });
});

// Register - Registers new user directly into the database
router.post('/register', (req: Request, res: Response) => {
  const {
    name,
    email,
    phone,
    role,
    password,
    address,
    vehicleType,
    vehicleMake,
    vehicleModel,
    vehicleRegNo,
    skills,
    workshopName
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Full name is required.' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Valid email address is required.' });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ success: false, message: 'Phone number is required.' });
  }
  if (!password || !password.trim()) {
    return res.status(400).json({ success: false, message: 'Password is required to secure your account.' });
  }
  if (password.trim().length < 4) {
    return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.getUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists in the database. Please sign in instead.'
    });
  }

  const selectedRole = role === 'mechanic' ? 'mechanic' : 'customer';
  const id = `${selectedRole.substring(0, 4)}-${Date.now()}`;

  const newUser: User = {
    id,
    email: normalizedEmail,
    password: password.trim(),
    name: name.trim(),
    phone: phone.trim(),
    role: selectedRole,
    avatar: selectedRole === 'mechanic'
      ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    address: address?.trim() || 'Mumbai Metro Area',
    lat: 19.0760 + (Math.random() - 0.5) * 0.04,
    lng: 72.8777 + (Math.random() - 0.5) * 0.04,
    createdAt: new Date().toISOString(),
    isBlocked: false
  };

  db.createUser(newUser);

  // If customer registered with vehicle information, persist to vehicle collection
  if (selectedRole === 'customer' && (vehicleMake || vehicleModel || vehicleRegNo)) {
    db.addVehicle({
      id: `veh-${Date.now()}`,
      customerId: newUser.id,
      type: vehicleType || 'car',
      make: vehicleMake || 'Hyundai',
      model: vehicleModel || 'Creta',
      year: 2023,
      regNo: vehicleRegNo || 'MH 02 EQ 8821',
      fuelType: 'petrol',
      color: 'White'
    });
  }

  // If mechanic registered, persist mechanic profile in database
  if (selectedRole === 'mechanic') {
    db.mechanics.set(id, {
      userId: id,
      workshopName: workshopName?.trim() || `${name.trim()}'s Roadfix Mobile Care`,
      experienceYears: 4,
      rating: 5.0,
      reviewCount: 0,
      isVerified: true,
      verificationDocs: {
        idProof: 'Aadhaar-Verified.pdf',
        drivingLicense: 'DL-Commercial-Verified.pdf',
        status: 'verified'
      },
      skills: Array.isArray(skills) && skills.length > 0
        ? skills
        : ['Battery Jumpstart', 'Tyre Puncture & Replacement', 'Brake Repair', 'Emergency Fuel Delivery'],
      supportedVehicleTypes: ['car', 'bike', 'scooter'],
      equipment: ['Hydraulic Jack', 'Tyre Inflator', 'Heavy Spanner Set', 'Jumper Cables', 'OBD-II Scanner'],
      isOnline: true,
      serviceRadiusKm: 15,
      hourlyRate: 350,
      baseServiceFee: 150,
      currentLat: newUser.lat,
      currentLng: newUser.lng,
      totalRepairs: 0,
      todayEarnings: 0,
      totalEarnings: 0,
      address: newUser.address || 'Mumbai'
    });
    db.saveToFile();
  }

  const profile = selectedRole === 'mechanic' ? db.getMechanicProfile(id) : undefined;

  res.status(201).json({
    success: true,
    message: 'Registered successfully in Roadfix database!',
    token: `roadfix-jwt-${newUser.id}-${Date.now()}`,
    user: {
      ...newUser,
      profile
    }
  });
});

// Current user profile
router.get('/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }

  const user = db.getUser(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const profile = user.role === 'mechanic' ? db.getMechanicProfile(user.id) : undefined;
  res.json({ success: true, user: { ...user, profile } });
});

// Update profile
router.put('/profile', (req: Request, res: Response) => {
  const userId = (req.body.id as string) || (req.headers['x-user-id'] as string);
  if (!userId) {
    return res.status(401).json({ success: false, message: 'User ID is required' });
  }

  const { name, phone, address, avatar, workshopName, hourlyRate, baseServiceFee } = req.body;
  const updates: Partial<User> = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (address) updates.address = address;
  if (avatar) updates.avatar = avatar;

  const updatedUser = db.updateUser(userId, updates);
  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  let profile = undefined;
  if (updatedUser.role === 'mechanic') {
    const profileUpdates: any = {};
    if (workshopName) profileUpdates.workshopName = workshopName;
    if (hourlyRate) profileUpdates.hourlyRate = Number(hourlyRate);
    if (baseServiceFee) profileUpdates.baseServiceFee = Number(baseServiceFee);
    profile = db.updateMechanicProfile(userId, profileUpdates);
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      ...updatedUser,
      profile
    }
  });
});

export default router;

