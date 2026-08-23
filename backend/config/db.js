import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (mongoUri) {
      try {
        const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
        console.log(`[Database] Connected to external MongoDB: ${conn.connection.host}`);
        return;
      } catch (err) {
        console.warn(`[Database] External MongoDB connection failed (${err.message}). Falling back to in-memory embedded MongoDB.`);
      }
    }

    // Fallback to in-memory mongo server for immediate plug-and-play execution
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[Database] Connected to embedded In-Memory MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
  }
};
