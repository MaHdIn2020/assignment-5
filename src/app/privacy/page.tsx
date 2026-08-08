// /privacy — Privacy Policy.

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      body: "When you use RentNest we may collect your name, email address, phone number, and the details you provide in rental requests, reviews, and contact messages. Payment information is processed by our payment provider and is never stored on our servers.",
    },
    {
      title: "2. How We Use Your Information",
      body: "Your information is used to create and manage your account, match tenants with landlords, process rental requests and payments, send important service notifications, and improve our platform. We never sell your personal data to third parties.",
    },
    {
      title: "3. Data Sharing",
      body: "Limited information is shared only where necessary to complete a transaction — for example, a tenant's name and contact details are shared with the landlord they request a property from. We only share data with service providers that help us operate (hosting, payments, analytics).",
    },
    {
      title: "4. Cookies & Local Storage",
      body: "RentNest uses browser local storage to keep you signed in and remember your theme preference. These are not third-party tracking cookies and do not leave your device.",
    },
    {
      title: "5. Data Security",
      body: "Passwords are hashed and never stored in plain text. Access tokens are short-lived, and all communication with our API is encrypted. We follow industry best practices to protect your data.",
    },
    {
      title: "6. Your Rights",
      body: "You may update your profile information at any time from your dashboard, or contact us to request a copy or deletion of your data. You can also request that we remove your account entirely.",
    },
    {
      title: "7. Contact",
      body: "For any privacy-related questions, email us at privacy@rentnest.com or use our contact page.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-bold text-text-primary mb-2">
        Privacy <span className="gradient-text">Policy</span>
      </h1>
      <p className="text-text-muted text-sm mb-8">Last updated: August 2026</p>

      <div className="space-y-6">
        {sections.map((s) => (
          <div key={s.title} className="card p-6">
            <h2 className="font-bold text-text-primary mb-2">{s.title}</h2>
            <p className="text-text-secondary text-sm leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
