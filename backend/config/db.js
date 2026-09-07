import mongoose from 'mongoose';
import { checkSupabaseConnection } from './supabase.js';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  const supabaseUrl = process.env.SUPABASE_URL;

  // 1. Check Supabase connection
  if (supabaseUrl && supabaseUrl.startsWith('http')) {
    console.log('[Database] Initializing Supabase PostgreSQL connection...');
    await checkSupabaseConnection();
    return;
  }

  // 2. Check MongoDB Atlas connection
  if (mongoUri && mongoUri.startsWith('mongodb')) {
    try {
      console.log('[Database] Connecting to MongoDB Atlas Cluster...');
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      });
      console.log(`[Database] ✅ Connected successfully to MongoDB: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`[Database Error] MongoDB Atlas connection failed: ${err.message}`);
    }
  }

  console.log('[Database] Running in standalone API mode with cloud storage endpoints ready.');
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};
