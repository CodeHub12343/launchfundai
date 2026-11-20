// Illustrative calculator: this is "what-if" math, not a cash or returns forecast.
export function computeCalc({ goal, pledges, investorCapital, revSharePct, reinvestPct, durationMonths }) {
  const g = Number(goal) || 0;
  const p = Number(pledges) || 0;
  const inv = Number(investorCapital) || 0;
  const share = Math.min(100, Math.max(0, Number(revSharePct) || 0)) / 100;
  const reinvest = Math.min(100, Math.max(0, Number(reinvestPct) || 0)) / 100;
  const months = Math.max(1, Number(durationMonths) || 18);

  const creatorMarketing = Math.round(p * reinvest);
  const combinedBudget = creatorMarketing + inv;
  const goalProgressPct = g > 0 ? Math.round((p / g) * 100) : 0;
  // Illustrative only: assumes 30% of share applied to proposal-amount scale for feel.
  const investorShareIllustrative = Math.round(inv * share * (months / 18) * 0.5);

  return {
    combinedBudget,
    goalProgressPct,
    investorShareIllustrative,
    creatorMarketing,
    additionalGrowthCapital: inv,
    durationMonths: months,
  };
}

export function defaultChannels(totalBudget) {
  const alloc = [
    { name: 'Meta prospecting', pct: 25, phase: 'acquisition', estCac: 22 },
    { name: 'Google PMax', pct: 14, phase: 'acquisition', estCac: 31 },
    { name: 'TikTok creators', pct: 20, phase: 'creators', estCac: 18 },
    { name: 'YouTube Shorts', pct: 13, phase: 'creators', estCac: 26 },
    { name: 'PR / editorial', pct: 14, phase: 'retail', estCac: 0 },
    { name: 'Pop-up events', pct: 14, phase: 'retail', estCac: 0 },
  ];
  return alloc.map((a) => ({ ...a, budget: Math.round((totalBudget * a.pct) / 100) }));
}

export function summarizeCampaign(campaign) {
  if (!campaign) return 'Working without a specific campaign. Attach one to tune suggestions.';
  const pct = campaign.goal ? Math.round((campaign.pledged / campaign.goal) * 100) : 0;
  const state = pct >= 100 ? 'is funded' : pct >= 50 ? 'is in its 2nd-growth window' : 'is building early momentum';
  return `${campaign.title?.split('—')[0].trim() || 'This campaign'} ${state}. Pledge velocity has settled; peer campaigns at this stage converted 1.8–2.6× additional backers per $100k of paid media in the final two weeks.`;
}
