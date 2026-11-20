import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import StudioPlan from '@/models/StudioPlan';
import Campaign from '@/models/Campaign';
import { defaultChannels, summarizeCampaign, computeCalc } from '@/lib/studio';

export async function GET(req) {
  let user;
  try { user = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('campaign') || '';

  let campaign = null;
  if (slug) campaign = await Campaign.findOne({ slug }).lean();
  else {
    campaign = await Campaign.findOne({ creator: user.id, status: { $in: ['published', 'funded'] } }).lean();
    if (!campaign) campaign = await Campaign.findOne({ creator: user.id }).lean();
  }

  let plan = null;
  if (campaign) plan = await StudioPlan.findOne({ user: user.id, campaignSlug: campaign.slug }).lean();
  if (!plan) plan = await StudioPlan.findOne({ user: user.id, campaign: null }).lean();

  if (!plan) {
    const total = 180000;
    plan = {
      version: 1,
      window: '30d',
      confidence: 'High',
      summary: summarizeCampaign(campaign),
      kpis: { suggestedCapital: total, projectedRoas: 3.2, additionalBackers: 2840, confidenceBand: 18 },
      phaseBudgets: { acquisition: 74000, creators: 62000, retail: 44000 },
      channels: defaultChannels(total),
      calc: { goal: campaign?.goal || 200000, pledges: campaign?.pledged || 280000, investorCapital: 180000, revSharePct: 8, reinvestPct: 22, durationMonths: 18 },
      messages: [
        { by: 'ai', text: 'Based on your pledge curve and audience, I\'d put 55% of budget into Meta + TikTok in the next 30 days.', at: new Date() },
      ],
      _draft: true,
    };
  }

  return NextResponse.json({
    plan,
    campaign: campaign ? { slug: campaign.slug, title: campaign.title, pledged: campaign.pledged, goal: campaign.goal } : null,
    calcResult: computeCalc(plan.calc),
  });
}

export async function PUT(req) {
  let user;
  try { user = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }
  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const { campaignSlug, patch = {} } = body;

  let campaign = null;
  if (campaignSlug) campaign = await Campaign.findOne({ slug: campaignSlug }).lean();

  const q = { user: user.id };
  if (campaignSlug) q.campaignSlug = campaignSlug;
  else q.campaignSlug = { $exists: false };

  let plan = await StudioPlan.findOne(q);
  if (!plan) {
    plan = new StudioPlan({
      user: user.id,
      campaign: campaign?._id,
      campaignSlug: campaign?.slug,
      channels: defaultChannels(180000),
      summary: summarizeCampaign(campaign),
    });
  }

  if (patch.window) plan.window = patch.window;
  if (patch.calc) plan.calc = { ...(plan.calc?.toObject?.() || plan.calc || {}), ...patch.calc };
  if (patch.phaseBudgets) plan.phaseBudgets = { ...(plan.phaseBudgets?.toObject?.() || plan.phaseBudgets || {}), ...patch.phaseBudgets };
  if (patch.channels) plan.channels = patch.channels;
  if (patch.kpis) plan.kpis = { ...(plan.kpis?.toObject?.() || plan.kpis || {}), ...patch.kpis };
  if (patch.summary != null) plan.summary = patch.summary;
  plan.version = (plan.version || 1) + 1;

  await plan.save();
  return NextResponse.json({ ok: true, plan: plan.toObject({ virtuals: true }), calcResult: computeCalc(plan.calc) });
}

export async function POST(req) {
  // Append a message to the plan's assistant transcript
  let user;
  try { user = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }
  await dbConnect();
  const { campaignSlug, text } = await req.json().catch(() => ({}));
  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 });

  const q = { user: user.id };
  if (campaignSlug) q.campaignSlug = campaignSlug;
  let plan = await StudioPlan.findOne(q);
  if (!plan) {
    let campaign = null;
    if (campaignSlug) campaign = await Campaign.findOne({ slug: campaignSlug }).lean();
    plan = await StudioPlan.create({
      user: user.id,
      campaign: campaign?._id,
      campaignSlug: campaign?.slug,
      channels: defaultChannels(180000),
      summary: summarizeCampaign(campaign),
    });
  }

  plan.messages.push({ by: 'me', text, at: new Date() });
  const reply = scriptedReply(text, plan);
  plan.messages.push({ by: 'ai', text: reply, at: new Date() });
  await plan.save();

  return NextResponse.json({ ok: true, messages: plan.messages.slice(-2) });
}

function scriptedReply(prompt, plan) {
  const p = prompt.toLowerCase();
  if (p.includes('cut pr') || p.includes('redirect')) {
    return 'Moving $8k from PR to creator UGC adds ~340 projected backers at your current rates. PR stays material for retail positioning, so I\'d keep $14k minimum.';
  }
  if (p.includes('caption') || p.includes('ad copy')) {
    return 'Draft caption: "Light that belongs to no one — until you decide where it goes. Modular. Magnetic. Ready in 14 days."';
  }
  if (p.includes('press')) {
    return 'Press release skeleton: 1) Hook (new category), 2) Proof (your pledge velocity), 3) Quote (you), 4) Availability. I can draft each section if you want.';
  }
  if (p.includes('cac') || p.includes('budget')) {
    const total = (plan.phaseBudgets?.acquisition || 0) + (plan.phaseBudgets?.creators || 0) + (plan.phaseBudgets?.retail || 0);
    return `At the current mix, your weighted CAC is around $23. If you shift 15% from Google PMax to TikTok creators, that drops nearer $19 — modeled, not guaranteed. Total planned budget: $${total.toLocaleString()}.`;
  }
  return 'I can drill into any channel, propose a budget shift, or draft creative. Try "cut PR to boost creators" or "generate a caption."';
}
