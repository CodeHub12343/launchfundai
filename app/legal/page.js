'use client';
import InfoPage from '@/components/InfoPage';

export default function LegalPage() {
  return (
    <InfoPage
      eyebrow="Legal & Compliance"
      title="Policies for a transparent marketplace."
      lede="Every partnership on LaunchFund AI is governed by the same written rules. No side letters, no verbal agreements. This page is the long form of what every term sheet points back to."
      sections={[
        {
          id: 'risk',
          label: 'Risk',
          eyebrow: 'Risk disclosure',
          title: 'Reaching a funding goal is not the same as being risk-free.',
          content: (
            <>
              <p>
                Post-goal capital deployed through LaunchFund AI is at risk. Campaigns can miss fulfillment windows, pivot their product roadmap, or under-deliver on agreed milestones. Revenue participation contracts are only enabled in jurisdictions where that structure is legally permitted and are milestone-gated by default.
              </p>
              <h3>What we require of every listing</h3>
              <ul>
                <li>Verified funding status on Kickstarter or Indiegogo.</li>
                <li>A written fulfillment plan and delivery timeline.</li>
                <li>Disclosure of material risks specific to the category (manufacturing, regulatory, logistics).</li>
                <li>A clear statement of the proposed capital structure and what triggers each tranche.</li>
              </ul>
              <h3>What partners should expect</h3>
              <p>
                No opportunity on the platform is described as guaranteed. Projections produced by the AI Marketing Studio are planning scenarios with explicit confidence bands, not forecasts. Past performance of comparable campaigns is reference data only.
              </p>
            </>
          ),
        },
        {
          id: 'terms',
          label: 'Terms',
          eyebrow: 'Terms of service',
          title: 'Terms of service.',
          content: (
            <>
              <p>
                By creating an account you agree to the rules of the marketplace: honest listings, honest proposals, and honest reporting. We can suspend accounts that materially mislead the other side of a deal.
              </p>
              <h3>Accounts</h3>
              <ul>
                <li>You must be at least 18 and legally able to enter into a contract.</li>
                <li>Creators must own the campaign they list or be authorised to represent it.</li>
                <li>Partners must be able to provide proof of funds or capability on request.</li>
              </ul>
              <h3>Fees</h3>
              <p>
                Creator Pro fees are 4% of capital actually deployed, charged against the tranche at release. Partner fees are 1.5% per closed deal. We never charge success fees beyond those two numbers and never charge listing fees.
              </p>
              <h3>Disputes</h3>
              <p>
                Term sheets signed on the platform include a baseline dispute path: mediation first, then binding arbitration under the governing law stated in the contract. LaunchFund AI is not a party to the term sheet but may pause capital releases where a dispute is open.
              </p>
            </>
          ),
        },
        {
          id: 'privacy',
          label: 'Privacy',
          eyebrow: 'Privacy policy',
          title: 'What we collect, what we don’t.',
          content: (
            <>
              <p>
                We collect the data we need to verify identities, show you the right campaigns and proposals, and move money safely. We do not sell personal data. Ever.
              </p>
              <h3>What we collect</h3>
              <ul>
                <li>Account details you provide (name, email, role, organisation).</li>
                <li>Campaign and proposal content you submit to the marketplace.</li>
                <li>Verification data required by our KYC and compliance providers.</li>
                <li>Operational data: login events, approvals, and milestone acknowledgements.</li>
              </ul>
              <h3>Who sees what</h3>
              <p>
                A creator sees proposals addressed to their campaign. A partner sees the listings and context they are considering. Admin staff can audit for safety and compliance, but we gate access on role and log it.
              </p>
              <h3>Your controls</h3>
              <p>
                You can export your data from Settings, revoke connected accounts, and request deletion. Deletion requests complete within 30 days except where we are legally required to retain records (for example, completed transactions).
              </p>
            </>
          ),
        },
        {
          id: 'compliance',
          label: 'Compliance',
          eyebrow: 'Compliance',
          title: 'How we stay on the right side of the rules.',
          content: (
            <>
              <p>
                Revenue participation structures are regulated differently in different jurisdictions. We review every term sheet against the applicable rules before capital releases, and we decline deal structures we cannot clear.
              </p>
              <h3>Jurisdictions</h3>
              <ul>
                <li>We geo-gate revenue-participation listings to jurisdictions where that contract form is permitted for non-accredited counterparties.</li>
                <li>Where accreditation is required, we verify it through our KYC provider before showing a partner the opportunity.</li>
                <li>Marketing sponsorships and growth-services deals, which are not investment products, are available more broadly.</li>
              </ul>
              <h3>Anti-money laundering</h3>
              <p>
                All payments move through regulated payment partners. We screen participants against sanctions lists and politically-exposed-person lists at onboarding and on an ongoing basis. Capital releases can be paused for review without notice if a match is produced.
              </p>
              <h3>Reporting</h3>
              <p>
                Suspicious activity is reported to the appropriate regulator in the jurisdiction of the counterparty under the applicable framework. We do not notify counterparties where notification is itself prohibited.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
