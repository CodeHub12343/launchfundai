export const PLAN_TIERS = {
  free: {
    key: 'free',
    label: 'Creator Free',
    role: 'creator',
    price: '$0',
    priceSuffix: 'forever',
    tagline: 'List, discover partners, use AI drafts.',
    features: [
      'List up to 1 live campaign',
      'Basic AI draft tools',
      'Community support',
    ],
    platformFeeBps: 700,
  },
  pro: {
    key: 'pro',
    label: 'Creator Pro',
    role: 'creator',
    price: '4%',
    priceSuffix: 'of deployed capital',
    tagline: 'Full AI Studio, priority matching, legal templates.',
    features: [
      'Unlimited campaigns',
      'Full AI Marketing Studio',
      'Priority partner matching',
      'Legal templates & diligence',
      'Lower 4% platform fee on pledges',
    ],
    platformFeeBps: 400,
    recommended: true,
  },
  investor: {
    key: 'investor',
    label: 'Investor / Partner',
    role: 'investor',
    price: '1.5%',
    priceSuffix: 'per deal',
    tagline: 'Deal flow, diligence tools, milestone tracking.',
    features: [
      'Deal flow access',
      'Diligence & milestone tracking',
      'Direct messaging with creators',
    ],
    platformFeeBps: 150,
  },
};

export const CREATOR_TIERS = ['free', 'pro'];

export function planLabelToKey(label) {
  if (!label) return null;
  const s = String(label).toLowerCase();
  if (s.includes('pro')) return 'pro';
  if (s.includes('investor') || s.includes('partner')) return 'investor';
  return 'free';
}

export function resolvePlan(user) {
  const key = planLabelToKey(user?.billing?.plan);
  if (user?.role === 'investor') return PLAN_TIERS.investor;
  return PLAN_TIERS[key] || PLAN_TIERS.free;
}
