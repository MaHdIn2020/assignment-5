import Link from "next/link";
import { Home, Mail, MapPin, Clock, Building2, UserPlus } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-3">
              <Home size={22} className="text-violet-400" />
              <span className="gradient-text">RentNest</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Bangladesh&apos;s modern rental marketplace connecting landlords with
              quality tenants.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-slate-200 font-semibold mb-3 text-sm uppercase tracking-wider">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: "Home", icon: Home },
                { href: "/properties", label: "Browse Properties", icon: Building2 },
                { href: "/auth/register", label: "Create Account", icon: UserPlus },
              ].map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-slate-400 hover:text-violet-400 transition-colors inline-flex items-center gap-1.5"
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
            <h3 className="text-slate-200 font-semibold mb-3 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-1.5"><Mail size={13} /> support@rentnest.com</li>
              <li className="flex items-center gap-1.5"><MapPin size={13} /> Dhaka, Bangladesh</li>
              <li className="flex items-center gap-1.5"><Clock size={13} /> Sun–Thu, 9AM–6PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} RentNest. All rights reserved.</p>
          <p>Built for Apollo Level-2 Web Dev — B7A5</p>
        </div>
      </div>
    </footer>
  );
}
