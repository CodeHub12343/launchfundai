import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    byName: String,
    byAvatar: String,
    text: { type: String, required: true, trim: true, maxlength: 4000 },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ThreadSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    participantNames: [String],
    participantAvatars: [String],
    subject: { type: String, default: '' },
    proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },
    proposalReference: String,
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    campaignSlug: String,
    messages: [MessageSchema],
    lastMessageAt: { type: Date, default: Date.now },
    lastMessageText: { type: String, default: '' },
    readBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: Date }],
  },
  { timestamps: true }
);

ThreadSchema.index({ participants: 1, lastMessageAt: -1 });

export default mongoose.models.Thread || mongoose.model('Thread', ThreadSchema);
