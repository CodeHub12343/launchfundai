import 'dotenv/config';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const email = process.argv[2] || 'admin@launchfund.ai';
const password = process.argv[3] || 'adminpass1234';

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  firstName: String, lastName: String,
  role: { type: String, enum: ['creator', 'investor', 'admin'] },
  acceptedTerms: Boolean,
}, { timestamps: true, strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

await mongoose.connect(process.env.MONGODB_URI);
let user = await User.findOne({ email: email.toLowerCase() });
if (user) {
  user.role = 'admin';
  await user.save();
  console.log(`Promoted ${email} to admin`);
} else {
  const passwordHash = await bcrypt.hash(password, 12);
  user = await User.create({ email: email.toLowerCase(), passwordHash, firstName: 'Platform', lastName: 'Admin', role: 'admin', acceptedTerms: true });
  console.log(`Created admin ${email} with password ${password}`);
}
await mongoose.disconnect();
