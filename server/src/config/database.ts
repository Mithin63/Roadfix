import mongoose from 'mongoose';
import {
  UserModel,
  MechanicProfileModel,
  VehicleModel,
  BookingModel,
  ReviewModel,
  NotificationModel,
  MaintenanceRecordModel,
  EmergencyContactModel,
  ComplaintModel
} from '../models';
import {
  INITIAL_USERS,
  INITIAL_MECHANIC_PROFILES,
  INITIAL_VEHICLES,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MAINTENANCE_RECORDS,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_COMPLAINTS
} from '../data/seeds';

let isMongoConnected = false;

export const connectMongoDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roadfix';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000
    });

    isMongoConnected = true;
    console.log(`\n========================================`);
    console.log(`🍃 Connected to MongoDB Database successfully!`);
    console.log(`📌 MongoDB URI: ${uri}`);
    console.log(`========================================\n`);

    // Check if initial users exist in MongoDB, if not auto-seed
    await seedMongoDBIfEmpty();
    return true;
  } catch (err: any) {
    isMongoConnected = false;
    console.warn(`\n⚠️ MongoDB connection note: Could not reach MongoDB at ${uri} (${err.message}).`);
    console.log(`🛡️ Falling back to persistent file store database (JSON). Data is safely persisted.`);
    console.log(`👉 To connect a live MongoDB instance, start mongod or set MONGODB_URI in your server/.env file.\n`);
    return false;
  }
};

export const isDatabaseConnected = () => isMongoConnected;

// Auto-seed MongoDB with initial demo records if collections are empty
async function seedMongoDBIfEmpty() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('🌱 MongoDB is empty. Seeding initial users, mechanics, and vehicles...');
      await UserModel.insertMany(INITIAL_USERS.map(u => ({ ...u, password: u.password || 'password123' })));
      await MechanicProfileModel.insertMany(INITIAL_MECHANIC_PROFILES);
      await VehicleModel.insertMany(INITIAL_VEHICLES);
      await BookingModel.insertMany(INITIAL_BOOKINGS as any);
      await ReviewModel.insertMany(INITIAL_REVIEWS);
      await NotificationModel.insertMany(INITIAL_NOTIFICATIONS);
      await MaintenanceRecordModel.insertMany(INITIAL_MAINTENANCE_RECORDS);
      await EmergencyContactModel.insertMany(INITIAL_EMERGENCY_CONTACTS);
      await ComplaintModel.insertMany(INITIAL_COMPLAINTS);
      console.log(`✅ MongoDB seeded with ${INITIAL_USERS.length} registered users & profiles.`);
    } else {
      console.log(`📊 Found ${userCount} registered users in MongoDB.`);
    }
  } catch (e) {
    console.error('Error seeding MongoDB:', e);
  }
}
