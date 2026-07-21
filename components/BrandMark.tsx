export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="80" height="80" rx="20" fill="#182036" />
      <path
        d="M22 30C22 25.6 25.6 22 30 22H50C54.4 22 58 25.6 58 30C58 34.4 54.4 38 50 38H30C25.6 38 22 41.6 22 46C22 50.4 25.6 54 30 54H50C54.4 54 58 50.4 58 46"
        stroke="white"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <circle cx="22" cy="30" r="5" fill="#FF5C2E" />
      <circle cx="58" cy="46" r="5" fill="#00C9A7" />
    </svg>
  );
}
