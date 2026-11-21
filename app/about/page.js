'use client';
import InfoPage from '@/components/InfoPage';

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="We think funded is the start line."
      lede="LaunchFund AI exists because a successful Kickstarter is rarely enough to carry a product to market. Creators need growth capital and partners need honest, structured deals. We built the marketplace that sits between them."
      sections={[
        {
          id: 'mission',
          label: 'Mission',
          eyebrow: 'Mission',
          title: 'Turn funded campaigns into shipped brands.',
          content: (
            <>
              <p>
                Thousands of creators hit their Kickstarter goal every year and then stall. The most common reasons are the same three: not enough marketing capital, no idea where to spend it, and no partner who understands the category. We fix those three problems with vetted partners, milestone-gated capital, and an AI studio that shows the math.
              </p>
              <p>
                Everything on the platform is transparent by default. Both sides see the same numbers. Capital releases on milestones everyone agreed to in writing. Nothing moves on a handshake.
              </p>
            </>
          ),
        },
        {
          id: 'careers',
          label: 'Careers',
          eyebrow: 'Careers',
          title: 'We’re hiring with intent.',
          content: (
            <>
              <p>
                We hire slowly and keep teams small. If you have shipped something hard, know marketplaces, crowdfunding, fintech, or applied AI, we probably want to talk to you.
              </p>
              <h3>Open roles</h3>
              <ul>
                <li>Senior full-stack engineer &mdash; marketplace core</li>
                <li>Growth lead &mdash; creator acquisition</li>
                <li>Compliance associate &mdash; revenue-participation structures</li>
                <li>Applied AI engineer &mdash; marketing planning models</li>
              </ul>
              <p>
                Send a note to <a href="mailto:careers@launchfund.ai">careers@launchfund.ai</a> with what you have built. No cover letter.
              </p>
            </>
          ),
        },
        {
          id: 'press',
          label: 'Press',
          eyebrow: 'Press',
          title: 'For journalists and researchers.',
          content: (
            <>
              <p>
                We publish aggregate marketplace data quarterly: deployed capital, average deal structure, category mix, time from listing to signed term sheet. Individual campaigns and partners are never named without their written consent.
              </p>
              <p>
                For interviews, data requests, or asset downloads, contact <a href="mailto:press@launchfund.ai">press@launchfund.ai</a>. We aim to respond within two business days.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
