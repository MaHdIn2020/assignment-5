// loading.tsx — shown during initial page load while the page suspends.
// Next.js renders this automatically — no setup needed.

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
          <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
        </div>
        <p className="text-slate-400 text-sm animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
