import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // 👈 Import Bcrypt
import { mockUsers, mockComplaints, mockNotifications } from './data/mockData.js';
import User from './models/User.js';
import Complaint from './models/Complaint.js';
import Notification from './models/Notification.js';

const mongoURI = process.env.MONGO_URI;
const SALT_ROUNDS = 10; // Standard salt rounds for Bcrypt

async function seed() {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected.');

    // --- 1. Clean Existing Data ---
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Notification.deleteMany({});
    console.log('Existing data cleared.');

    // --- 2. Process and Hash User Passwords ---
    const usersToInsert = [];
    for (const user of mockUsers) {
      // Hash the password using Bcrypt
      // NOTE: We assume 'user.password' contains the plaintext password in mockData.js
      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
      
      // Store the user object with the hashed password
      usersToInsert.push({
        ...user,
        password: hashedPassword, // 👈 Overwrite plaintext password with the hash
      });
    }
    
    // --- 3. Insert Data ---
    await User.insertMany(usersToInsert);
    await Complaint.insertMany(mockComplaints);
    await Notification.insertMany(mockNotifications);

    console.log('Mock data inserted successfully.');
    
  } catch (err) {
    console.error('MongoDB seeding error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

seed();