import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const User = (await import('../models/User.js')).default;
const Pledge = (await import('../models/Pledge.js')).default;
const Campaign = (await import('../models/Campaign.js')).default;
const Proposal = (await import('../models/Proposal.js')).default;

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI not set');

await mongoose.connect(MONGODB_URI, { family: 4 });
console.log('connected');

const testUsers = await User.find({ email: /@(local\.test|example\.com|test\.test)$/i }).select('_id email');
const ids = testUsers.map((u) => u._id);
console.log('Found test users:', testUsers.map((u) => u.email));

if (ids.length) {
  const [c, p, pl, u] = await Promise.all([
    Campaign.deleteMany({ creator: { $in: ids } }),
    Proposal.deleteMany({ $or: [{ creator: { $in: ids } }, { from: { $in: ids } }] }),
    Pledge.deleteMany({ $or: [{ creator: { $in: ids } }, { backer: { $in: ids } }] }),
    User.deleteMany({ _id: { $in: ids } }),
  ]);
  console.log(`Deleted campaigns: ${c.deletedCount}, proposals: ${p.deletedCount}, pledges: ${pl.deletedCount}, users: ${u.deletedCount}`);
} else {
  console.log('No test accounts found.');
}

await mongoose.disconnect();
