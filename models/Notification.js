import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: {
      type: String,
      enum: ['proposal', 'milestone', 'ai', 'view', 'approval', 'warn', 'message', 'system'],
      required: true,
    },
    category: { type: String, enum: ['proposals', 'milestones', 'system'], default: 'system' },
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    href: { type: String, default: '' },
    ctaLabel: { type: String, default: '' },
    read: { type: Boolean, default: false, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

NotificationSchema.index({ user: 1, createdAt: -1 });

export async function notify(user, payload) {
  const Notif = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
  return Notif.create({ user, ...payload });
}

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
