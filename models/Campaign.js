import mongoose from 'mongoose';

const MilestoneSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'active', 'done'], default: 'pending' },
    dueAt: { type: Date },
  },
  { _id: false }
);

const RiskSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const CampaignSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['Hardware', 'Tech', 'Games', 'Food & Beverage', 'Fashion', 'Home', 'Publishing', 'Travel', 'Other'],
      required: true,
      index: true,
    },
    platform: { type: String, enum: ['kickstarter', 'indiegogo', 'other'], default: 'kickstarter' },
    platformUrl: { type: String, default: '' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creatorName: { type: String, default: '' },
    creatorLocation: { type: String, default: '' },

    image: { type: String, default: '' },
    gallery: { type: [String], default: [] },

    pledged: { type: Number, default: 0 },
    goal: { type: Number, required: true },
    backers: { type: Number, default: 0 },
    daysLeft: { type: Number, default: 0 },

    seeking: { type: Number, required: true },
    minAcceptable: { type: Number, default: 0 },
    model: {
      type: String,
      enum: ['sponsor', 'participation', 'growth'],
      default: 'participation',
      index: true,
    },
    revenueSharePct: { type: Number, default: 0 },
    returnCap: { type: String, default: '' },

    jurisdiction: { type: String, default: 'Delaware, USA' },
    milestones: { type: [MilestoneSchema], default: [] },
    risks: { type: [RiskSchema], default: [] },

    status: {
      type: String,
      enum: ['draft', 'in_review', 'published', 'funded', 'archived'],
      default: 'draft',
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    verified: { type: Boolean, default: false },

    views: { type: Number, default: 0 },
    savedBy: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  },
  { timestamps: true }
);

CampaignSchema.virtual('percent').get(function () {
  if (!this.goal) return 0;
  return Math.round((this.pledged / this.goal) * 100);
});

CampaignSchema.set('toJSON', { virtuals: true });
CampaignSchema.set('toObject', { virtuals: true });

export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
