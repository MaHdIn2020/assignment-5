import Link from "next/link";
import {
  Home,
  Mail,
  MapPin,
  Clock,
  Building2,
  UserPlus,
  Newspaper,
  Info,
  ShieldCheck,
  FileText,
  LifeBuoy,
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  GithubIcon,
} from "@/components/SocialIcons";

export function Footer() {
  const exploreLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/properties", label: "Browse Properties", icon: Building2 },
    { href: "/about", label: "About Us", icon: Info },
    { href: "/blog", label: "Blog", icon: Newspaper },
    { href: "/auth/register", label: "Create Account", icon: UserPlus },
  ];

  const legalLinks = [
    { href: "/privacy", label: "Privacy Policy", icon: ShieldCheck },
    { href: "/terms", label: "Terms of Service", icon: FileText },
    { href: "/contact", label: "Contact", icon: Mail },
    { href: "/help", label: "Help Center", icon: LifeBuoy },
  ];

  const socialLinks = [
    { href: "https://facebook.com", label: "Facebook", icon: FacebookIcon },
    { href: "https://instagram.com", label: "Instagram", icon: InstagramIcon },
    { href: "https://twitter.com", label: "Twitter", icon: TwitterIcon },
    { href: "https://github.com", label: "GitHub", icon: GithubIcon },
  ];

  return (
    <footer className="border-t border-card-border bg-surface mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-xl mb-3">
              <Home size={22} className="text-accent-primary" />
              <span className="gradient-text">RentNest</span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Bangladesh&apos;s modern rental marketplace connecting landlords with
              quality tenants.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-card-border flex items-center justify-center text-text-secondary hover:text-accent-primary hover:border-card-border-hover transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-text-primary font-semibold mb-3 text-sm uppercase tracking-wider">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              {exploreLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-text-secondary hover:text-accent-primary transition-colors inline-flex items-center gap-1.5"
                  >
                    <Icon size={13} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & support */}
          <div>
            <h3 className="text-text-primary font-semibold mb-3 text-sm uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              {legalLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-text-secondary hover:text-accent-primary transition-colors inline-flex items-center gap-1.5"
                  >
                    <Icon size={13} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-text-primary font-semibold mb-3 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-center gap-1.5">
                <Mail size={13} /> support@rentnest.com
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin size={13} /> Gulshan 2, Dhaka, Bangladesh
              </li>
              <li className="flex items-center gap-1.5">
                <Clock size={13} /> Sun–Thu, 9AM–6PM
              </li>
              <li className="flex items-center gap-1.5">
                <Building2 size={13} /> Office 4B, RentNest Tower
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-card-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-text-muted">
          <p>&copy; {new Date().getFullYear()} RentNest. All rights reserved.</p>
          <p>Built for Apollo Level-2 Web Dev — B7A5</p>
        </div>
      </div>
    </footer>
  );
}
