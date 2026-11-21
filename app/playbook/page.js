'use client';
import InfoPage from '@/components/InfoPage';

export default function PlaybookPage() {
  return (
    <InfoPage
      eyebrow="The Playbook"
      title="From funded to flagship, in writing."
      lede="Every deal on LaunchFund AI follows the same loop. This page is the long version of the four steps on the homepage: what each step looks like in practice, and what makes it go wrong when it does."
      sections={[
        {
          id: 'overview',
          label: 'Overview',
          eyebrow: 'Overview',
          title: 'The loop, in one page.',
          content: (
            <>
              <p>
                A creator lists a funded campaign. The AI Studio drafts a 30/60/90 growth plan with a defensible capital ask. Vetted partners submit non-binding proposals. Terms are compared side by side and one is signed. Capital releases milestone by milestone, and both sides see the same numbers in the dashboard throughout.
              </p>
              <p>
                No step is optional. We do not run back-channel deals, we do not accept proposals that bypass the comparison view, and we do not release capital outside signed milestones.
              </p>
            </>
          ),
        },
        {
          id: 'listing',
          label: 'Listing',
          eyebrow: 'Step one',
          title: 'Submit your funded campaign.',
          content: (
            <>
              <p>
                You connect your Kickstarter or Indiegogo campaign. We verify funding status, the legal entity behind it, prior delivery history, and the identity of signatories. The verified badge only shows once all four pass.
              </p>
              <p>
                Required information at listing time: funding total, backer count, category, fulfillment plan, and any already-known risks. Hiding a risk now is the single fastest way to end a deal later.
              </p>
            </>
          ),
        },
        {
          id: 'plan',
          label: 'Plan',
          eyebrow: 'Step two',
          title: 'AI plans your growth.',
          content: (
            <>
              <p>
                The Marketing Studio reads your category, audience, and backer velocity, then drafts a 30/60/90 plan with a channel mix, a weekly test cadence, and a capital ask with a confidence band. You can edit any line before it becomes part of your listing.
              </p>
              <p>
                The plan is a planning scenario, not a forecast. We label it that way in the product and we label it that way in every partner view.
              </p>
            </>
          ),
        },
        {
          id: 'proposals',
          label: 'Proposals',
          eyebrow: 'Step three',
          title: 'Receive partner proposals.',
          content: (
            <>
              <p>
                Vetted sponsors, agencies, and funds submit non-binding proposals through the product. Each proposal states its structure (sponsorship, revenue participation, or growth partnership), the capital or services offered, and the milestones it is willing to gate releases on.
              </p>
              <p>
                You can accept, counter, or decline. All negotiation happens on-platform so both sides have one record of truth.
              </p>
            </>
          ),
        },
        {
          id: 'execution',
          label: 'Execution',
          eyebrow: 'Step four',
          title: 'Execute against milestones.',
          content: (
            <>
              <p>
                The signed term sheet defines each milestone and what the partner releases on each one. Capital sits in escrow with our payment partner. You acknowledge a milestone in the product, the partner approves, and the tranche releases. Both sides see the same dashboard.
              </p>
              <p>
                Disputes pause the next release and go to the dispute path in the term sheet. We do not take sides; we take evidence.
              </p>
            </>
          ),
        },
        {
          id: 'case-studies',
          label: 'Case studies',
          eyebrow: 'In practice',
          title: 'What a deal actually looks like.',
          content: (
            <>
              <p>
                We publish case studies quarterly, with the creator and partner named only where both sides agreed to be. For this quarter we are preparing three write-ups across hardware, games, and food &amp; beverage, with the exact milestone schedule, capital released against each, and the outcome at day 90.
              </p>
              <p>
                Interested in reading a draft or comparing structures for your category? Email <a href="mailto:hello@launchfund.ai">hello@launchfund.ai</a>.
              </p>
            </>
          ),
        },
        {
          id: 'blog',
          label: 'Writing',
          eyebrow: 'Writing',
          title: 'Short pieces we have published.',
          content: (
            <>
              <p>
                Our writing lives next to the product rather than on a separate marketing blog. The pieces worth reading right now:
              </p>
              <ul>
                <li><strong>Why we only gate on milestones.</strong> The short case for never releasing capital on a handshake.</li>
                <li><strong>Reading a backer-velocity curve.</strong> Three patterns that predict whether paid marketing will work post-goal.</li>
                <li><strong>Revenue share versus profit share.</strong> Why most of our deals are structured on defined revenue, not profit.</li>
              </ul>
              <p>
                We publish when we have something to say. Email <a href="mailto:hello@launchfund.ai">hello@launchfund.ai</a> to be added to the low-volume announcement list.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
