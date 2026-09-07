import mongoose from 'mongoose';
import { checkSupabaseConnection } from './supabase.js';
import { seedDatabase } from '../utils/seedData.js';

const DEFAULT_ATLAS_URI = 'mongodb+srv://itsmeshivam885_db_user:yJXUBuZmvwql8k7h@quickkart1.v7je6oo.mongodb.net/quickkart?retryWrites=true&w=majority&appName=QuickKart1';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;
  const supabaseUrl = process.env.SUPABASE_URL;

  // 1. If Supabase credentials exist, initialize Supabase connection check
  if (supabaseUrl && supabaseUrl.startsWith('http')) {
    console.log('[Supabase] Initializing Supabase PostgreSQL connection...');
    await checkSupabaseConnection();
  }

  // 2. Connect Mongoose for full-featured schema & models (Shops, Products, Requests, Reservations, Reviews)
  try {
    console.log('[Database] Connecting to MongoDB Atlas Cloud Cluster...');
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
    });
    console.log(`[Database] ✅ Connected successfully to MongoDB: ${conn.connection.host}`);
    
    // Auto-seed if needed
    await seedDatabase();
  } catch (err) {
    console.error(`[Database Error] MongoDB Atlas connection failed: ${err.message}`);
  }
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};
