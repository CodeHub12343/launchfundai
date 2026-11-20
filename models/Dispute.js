import mongoose from 'mongoose';

const DisputeSchema = new mongoose.Schema(
  {
    reference: { type: String, unique: true, required: true },
    subject: { type: String, enum: ['M2 missed', 'Reporting delay', 'Terms interpretation', 'Payment', 'Other'], default: 'Other' },
    status: { type: String, enum: ['open', 'resolved', 'rejected'], default: 'open', index: true },
    severity: { type: String, enum: ['default', 'warning', 'danger'], default: 'default' },
    proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },
    proposalReference: String,
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    partnerName: String,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    creatorName: String,
    openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, default: '' },
    resolution: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Dispute || mongoose.model('Dispute', DisputeSchema);
