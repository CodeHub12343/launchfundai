'use client';
import InfoPage from '@/components/InfoPage';

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="Talk to us like you mean it."
      lede="The fastest way to a real answer is to use the address that matches your question. Everything else routes through the front door and takes longer."
      sections={[
        {
          id: 'general',
          label: 'General',
          eyebrow: 'Front door',
          title: 'General enquiries.',
          content: (
            <>
              <p>
                For anything that does not fit the categories below, email <a href="mailto:hello@launchfund.ai">hello@launchfund.ai</a>. We answer within one business day.
              </p>
            </>
          ),
        },
        {
          id: 'creators',
          label: 'Creators',
          eyebrow: 'For creators',
          title: 'Listing a funded campaign.',
          content: (
            <>
              <p>
                If you have a funded Kickstarter or Indiegogo campaign and want to list it, you can start directly in the product and we will reach out as part of verification. For pre-listing questions, email <a href="mailto:creators@launchfund.ai">creators@launchfund.ai</a>.
              </p>
            </>
          ),
        },
        {
          id: 'partners',
          label: 'Partners',
          eyebrow: 'For partners',
          title: 'Access for sponsors, agencies, and funds.',
          content: (
            <>
              <p>
                Partner access is manually reviewed. Send a short note about who you back, cheque size, and category focus to <a href="mailto:partners@launchfund.ai">partners@launchfund.ai</a>. We respond within two business days.
              </p>
            </>
          ),
        },
        {
          id: 'help',
          label: 'Help',
          eyebrow: 'Help & support',
          title: 'I’m already on the platform and something is wrong.',
          content: (
            <>
              <p>
                For account, billing, or payout issues, email <a href="mailto:support@launchfund.ai">support@launchfund.ai</a> from the address on your account. Please include the campaign or proposal id so we can find it quickly.
              </p>
              <p>
                For urgent compliance or payout holds, say so in the subject line and we triage within the hour during business days.
              </p>
            </>
          ),
        },
        {
          id: 'press',
          label: 'Press',
          eyebrow: 'Press',
          title: 'Journalists and researchers.',
          content: (
            <>
              <p>
                <a href="mailto:press@launchfund.ai">press@launchfund.ai</a> for interviews, data, or assets. Details on the <a href="/about#press">About page</a>.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
