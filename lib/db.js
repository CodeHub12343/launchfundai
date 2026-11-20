import mongoose from 'mongoose';
import dns from 'dns';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not set in .env.local');
}

// mongodb+srv:// requires DNS SRV lookups, which fail on some Windows
// setups via the system resolver. Point Node at public DNS so Atlas
// cluster discovery works regardless of the host network config.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      family: 4,
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
