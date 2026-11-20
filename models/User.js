import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['creator', 'investor', 'admin'], default: 'creator', index: true },
    company: { type: String, trim: true, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    avatar: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    acceptedTerms: { type: Boolean, default: false },
    notificationPrefs: {
      email: { type: Boolean, default: true },
      product: { type: Boolean, default: true },
      deals: { type: Boolean, default: false },
      summary: { type: Boolean, default: true },
    },
    recoveryEmail: { type: String, default: '' },
    billing: {
      plan: { type: String, default: 'Creator Pro' },
      email: { type: String, default: '' },
      cardLast4: { type: String, default: '' },
      cardExpiry: { type: String, default: '' },
      taxId: { type: String, default: '' },
    },
    connectedAccounts: {
      type: Map,
      of: new mongoose.Schema({ meta: String, connected: Boolean }, { _id: false }),
      default: () => ({}),
    },
    team: [{ name: String, email: String, role: { type: String, enum: ['Owner', 'Admin', 'Editor'], default: 'Editor' }, invitedAt: { type: Date, default: Date.now } }],
    legal: {
      jurisdiction: { type: String, default: '' },
      eligible: { type: Boolean, default: true },
      eligibilityReviewedAt: { type: Date },
    },
    archived: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

UserSchema.virtual('initials').get(function () {
  return `${this.firstName?.[0] || ''}${this.lastName?.[0] || ''}`.toUpperCase();
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
