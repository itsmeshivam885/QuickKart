import mongoose from 'mongoose';

let mongod = null;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  // In production (Render/Cloud) or if MONGODB_URI is specified
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
      if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
        console.error('[Database Error] Please verify MONGODB_URI in Render Environment Variables and ensure IP 0.0.0.0/0 is allowed in Atlas Network Access.');
        process.exit(1);
      }
    }
  }

  // Local development fallback only
  try {
    console.log('[Database] Falling back to local embedded In-Memory MongoDB...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[Database] Connected to embedded In-Memory MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Local In-Memory Mongo fallback failed: ${error.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
};
