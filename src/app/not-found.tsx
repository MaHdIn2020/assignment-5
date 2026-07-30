import Link from "next/link";
import { Home, Building2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card-elevated p-12 max-w-md text-center space-y-6">
        <div className="text-7xl font-black gradient-text">404</div>
        <h1 className="text-2xl font-bold text-slate-100">Page Not Found</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">
            <Home size={16} /> Go Home
          </Link>
          <Link href="/properties" className="btn-secondary">
            <Building2 size={16} /> Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
