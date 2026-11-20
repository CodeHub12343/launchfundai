import mongoose from 'mongoose';

const ModerationItemSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    campaignSlug: String,
    title: { type: String, required: true },
    reason: { type: String, required: true },
    severity: { type: String, enum: ['default', 'warning', 'danger'], default: 'warning' },
    status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open', index: true },
  },
  { timestamps: true }
);

export default mongoose.models.ModerationItem || mongoose.model('ModerationItem', ModerationItemSchema);
