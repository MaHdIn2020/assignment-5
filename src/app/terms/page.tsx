// /terms — Terms of Service.

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      body: "By creating an account or using RentNest, you agree to these Terms of Service. If you do not agree, please do not use the platform.",
    },
    {
      title: "2. Accounts",
      body: "You are responsible for keeping your login credentials secure and for all activity under your account. You must be at least 18 years old to rent or list a property. One person may hold one tenant account and one landlord account.",
    },
    {
      title: "3. Tenant Conduct",
      body: "Tenants agree to provide accurate information in rental requests, to honour approved rentals and payments, and to treat listed properties and landlords with respect.",
    },
    {
      title: "4. Landlord Conduct",
      body: "Landlords agree to list accurate, up-to-date property information and honest rent amounts. Falsified listings may result in account suspension or removal of listings.",
    },
    {
      title: "5. Payments",
      body: "Rental payments made through RentNest are processed by a third-party payment provider. RentNest is not a bank and payment confirmation is subject to the provider's processing.",
    },
    {
      title: "6. Content & Reviews",
      body: "You retain ownership of content you post (reviews, messages, listings). You agree not to post unlawful, defamatory, or misleading content. RentNest may moderate or remove content that violates these terms.",
    },
    {
      title: "7. Limitation of Liability",
      body: "RentNest provides a marketplace platform and is not a party to any tenancy agreement between landlords and tenants. We are not liable for disputes arising between users.",
    },
    {
      title: "8. Termination",
      body: "We may suspend or terminate accounts that violate these terms or applicable law. You may delete your account at any time by contacting support.",
    },
    {
      title: "9. Changes to These Terms",
      body: "We may update these terms from time to time. Continued use of RentNest after changes take effect constitutes acceptance of the revised terms.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-bold text-text-primary mb-2">
        Terms of <span className="gradient-text">Service</span>
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
