import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema(
  {
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['submitted', 'countered', 'accepted', 'declined', 'withdrawn', 'documents_requested'], required: true },
    note: { type: String, default: '' },
    terms: { type: Object, default: null },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const MessageSchema = new mongoose.Schema(
  {
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    byName: { type: String, default: '' },
    byRole: { type: String, enum: ['creator', 'investor', 'admin'], default: 'investor' },
    text: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ProposalSchema = new mongoose.Schema(
  {
    reference: { type: String, unique: true, index: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    campaignSlug: { type: String, required: true, index: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fromName: { type: String, default: '' },

    model: { type: String, enum: ['sponsor', 'participation', 'growth'], default: 'participation' },
    amount: { type: Number, required: true },
    releaseAcross: { type: String, default: '3 milestones' },
    revenueSharePct: { type: Number, default: 0 },
    returnCap: { type: String, default: '' },
    durationMonths: { type: Number, default: 18 },
    reportingCadence: { type: String, default: 'Monthly (automated)' },
    initialMessage: { type: String, default: '' },

    status: { type: String, enum: ['open', 'countered', 'accepted', 'declined', 'withdrawn', 'expired'], default: 'open', index: true },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },

    messages: { type: [MessageSchema], default: [] },
    history: { type: [HistorySchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Proposal || mongoose.model('Proposal', ProposalSchema);
