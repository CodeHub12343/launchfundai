// Usage: node scripts/clear-seed-data.mjs
// Removes the demo creator account and the seeded campaigns it owns, along
// with every proposal, message, and notification linked to them. Run once
// before opening the site to real users.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';

const DEMO_EMAIL = 'demo@launchfund.ai';
const DEMO_SLUGS = [
  'lumen-mesh',
  'noon-nine',
  'riverstone',
  'ashvale',
  'tern',
  'kettle-pine',
  'fieldbook',
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const creator = await db.collection('users').findOne({ email: DEMO_EMAIL });
  const creatorId = creator?._id;

  const campaignQuery = creatorId
    ? { $or: [{ slug: { $in: DEMO_SLUGS } }, { creator: creatorId }] }
    : { slug: { $in: DEMO_SLUGS } };

  const campaigns = await db.collection('campaigns').find(campaignQuery).project({ _id: 1, slug: 1 }).toArray();
  const campaignIds = campaigns.map((c) => c._id);

  const proposalQuery = campaignIds.length ? { campaign: { $in: campaignIds } } : null;
  const proposals = proposalQuery
    ? await db.collection('proposals').find(proposalQuery).project({ _id: 1 }).toArray()
    : [];
  const proposalIds = proposals.map((p) => p._id);

  if (proposalIds.length) {
    const msgRes = await db.collection('messages').deleteMany({ proposal: { $in: proposalIds } });
    console.log('Deleted messages:', msgRes.deletedCount);
    const propRes = await db.collection('proposals').deleteMany({ _id: { $in: proposalIds } });
    console.log('Deleted proposals:', propRes.deletedCount);
  }

  if (campaignIds.length) {
    const campRes = await db.collection('campaigns').deleteMany({ _id: { $in: campaignIds } });
    console.log('Deleted campaigns:', campRes.deletedCount, '—', campaigns.map((c) => c.slug).join(', '));
  }

  if (creatorId) {
    const notifRes = await db.collection('notifications').deleteMany({ user: creatorId });
    console.log('Deleted demo notifications:', notifRes.deletedCount);
    const userRes = await db.collection('users').deleteOne({ _id: creatorId });
    console.log('Deleted demo creator:', userRes.deletedCount);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
