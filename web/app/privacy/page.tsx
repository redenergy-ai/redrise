export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface-0 text-ink-base px-4 py-10 sm:py-16">
      <article className="max-w-3xl mx-auto space-y-8">
        <header>
          <p className="text-sm font-semibold text-brand-500">RedRise Privacy Policy</p>
          <h1 className="text-3xl font-bold mt-1">Privacy, consent, and your data</h1>
          <p className="text-sm text-ink-muted mt-3">
            RedRise is designed to give you meaningful control over health-related and wellness data you choose to provide.
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">What we collect</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            Depending on how you use RedRise, data may include account details, wellness check-ins, health-related profile information, supplement logs, conversation history, and app settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">Consent</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            Creating an account that stores health-related information requires explicit consent to the collection and processing described here. Consent for sharing anonymized data with supplement partners for research purposes is separate and optional. It is off by default and can be changed independently.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">Your rights</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            You can access and export your stored data, request correction of inaccurate information, change optional data-sharing consent, and request deletion of your account and associated data from the My Data area of your account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">Data retention</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            Account content and health-related data are retained only while your account is active and are scheduled for deletion when the account is closed. Limited security, transaction, or compliance records may be retained only where a legal obligation requires it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">Security compromises</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            If a security compromise affects personal information, RedRise will investigate, contain and assess the incident, and notify South Africa&apos;s Information Regulator and affected users as soon as reasonably possible where POPIA requires notification. Any additional sector regulator notification, including SAHPRA, will be made only where a separate applicable legal or regulatory duty requires it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">Contact and requests</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            Privacy requests can be initiated from your account. RedRise should publish the responsible party and Information Officer contact details here before production launch.
          </p>
        </section>
      </article>
    </main>
  );
}
