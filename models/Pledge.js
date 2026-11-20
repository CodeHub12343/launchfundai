import mongoose from 'mongoose';

const PledgeSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    campaignSlug: { type: String, required: true, index: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    backer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    backerEmail: { type: String, default: '' },
    backerName: { type: String, default: '' },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    platformFee: { type: Number, default: 0 },

    stripeCheckoutSessionId: { type: String, index: true },
    stripePaymentIntentId: { type: String, index: true },
    stripeTransferId: { type: String, default: '' },
    stripeDestinationAccount: { type: String, default: '' },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Pledge || mongoose.model('Pledge', PledgeSchema);
