import Link from "next/link";

// not-found.tsx — shown for any URL that doesn't match a route.
// This is a Server Component (no "use client" needed).

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass-card p-12 max-w-md text-center space-y-6">
        <div className="text-7xl font-black gradient-text">404</div>
        <h1 className="text-2xl font-bold text-slate-100">Page Not Found</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-gradient">
            Go Home
          </Link>
          <Link href="/properties" className="btn-outline">
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
