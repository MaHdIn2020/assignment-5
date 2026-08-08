// Inline SVG brand icons (lucide-react removed brand glyphs).
// Each accepts size + className so they drop into existing icon usage.

interface IconProps {
  size?: number;
  className?: string;
}

export function GoogleIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M21.35 12.23c0-.79-.07-1.54-.2-2.27H12v4.5h5.24a5.03 5.03 0 0 1-2.18 3.3v2.73h3.52c2.07-1.9 3.27-4.7 3.27-8.26Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.95 0 5.43-.98 7.24-2.66l-3.52-2.73c-.98.66-2.24 1.05-3.72 1.05-2.86 0-5.29-1.93-6.15-4.53H2.26v2.82A10.99 10.99 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M5.85 13.13a6.6 6.6 0 0 1 0-4.26V6.05H2.26a11 11 0 0 0 0 9.9l3.59-2.82Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.34c1.6 0 3.04.55 4.17 1.64l3.12-3.12A10.95 10.95 0 0 0 12 1 10.99 10.99 0 0 0 2.26 6.05l3.59 2.82C6.7 6.27 9.14 4.34 12 4.34Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function FacebookIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M13.5 21.5v-8.25h2.77l.41-3.21H13.5V7.66c0-.93.26-1.56 1.59-1.56h1.7V3.24c-.3-.04-1.31-.13-2.49-.13-2.47 0-4.16 1.51-4.16 4.27v2.38H7.37v3.21h2.77v8.53h3.36Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function TwitterIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82L5 21.75H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
    </svg>
  );
}

export function GithubIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12.13a11.5 11.5 0 0 0 7.86 10.92c.58.11.79-.25.79-.56v-2.28c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.18 1.77 1.18 1.03 1.75 2.7 1.24 3.36.95.1-.74.4-1.24.72-1.53-2.55-.28-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.19-3.07-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.17a11 11 0 0 1 5.8 0c2.2-1.48 3.17-1.17 3.17-1.17.63 1.59.23 2.76.12 3.05.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.65.41.35.77 1.04.77 2.1v3.12c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12.13 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
