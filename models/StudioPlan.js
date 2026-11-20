import mongoose from 'mongoose';

const ChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pct: { type: Number, default: 0 },
    budget: { type: Number, default: 0 },
    estCac: { type: Number, default: 0 },
    phase: { type: String, enum: ['acquisition', 'creators', 'retail'], default: 'acquisition' },
  },
  { _id: false }
);

const MessageSchema = new mongoose.Schema(
  {
    by: { type: String, enum: ['ai', 'me'], required: true },
    text: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CalcSchema = new mongoose.Schema(
  {
    goal: { type: Number, default: 200000 },
    pledges: { type: Number, default: 280000 },
    investorCapital: { type: Number, default: 180000 },
    revSharePct: { type: Number, default: 8 },
    reinvestPct: { type: Number, default: 22 },
    durationMonths: { type: Number, default: 18 },
  },
  { _id: false }
);

const StudioPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    campaignSlug: String,
    version: { type: Number, default: 1 },
    window: { type: String, enum: ['30d', '60d', '90d'], default: '30d' },
    confidence: { type: String, enum: ['Low', 'Medium', 'High'], default: 'High' },
    summary: { type: String, default: '' },
    kpis: {
      suggestedCapital: { type: Number, default: 180000 },
      projectedRoas: { type: Number, default: 3.2 },
      additionalBackers: { type: Number, default: 2840 },
      confidenceBand: { type: Number, default: 18 },
    },
    phaseBudgets: {
      acquisition: { type: Number, default: 74000 },
      creators: { type: Number, default: 62000 },
      retail: { type: Number, default: 44000 },
    },
    channels: [ChannelSchema],
    calc: { type: CalcSchema, default: () => ({}) },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

StudioPlanSchema.index({ user: 1, campaignSlug: 1 }, { unique: true, partialFilterExpression: { campaignSlug: { $type: 'string' } } });

export default mongoose.models.StudioPlan || mongoose.model('StudioPlan', StudioPlanSchema);
