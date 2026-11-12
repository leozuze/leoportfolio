export default function Logo({ size = 34, className = "" }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-border bg-surface ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.68}
        height={size * 0.68}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="transition-transform duration-500 ease-out group-hover:rotate-90 motion-reduce:transform-none"
      >
        <rect
          x="16" y="2"
          width="19.8" height="19.8"
          transform="rotate(45 16 16)"
          stroke="var(--color-accent)"
          strokeOpacity="0.35"
          strokeWidth="1.4"
        />

        <path d="M16 16 L16 4 L22 10 Z" fill="var(--color-accent)" fillOpacity="0.9" />
        <path d="M16 16 L28 16 L22 22 Z" fill="var(--color-accent)" fillOpacity="0.7" />
        <path d="M16 16 L16 28 L10 22 Z" fill="var(--color-accent)" fillOpacity="0.9" />
        <path d="M16 16 L4 16 L10 10 Z" fill="var(--color-accent)" fillOpacity="0.7" />

        <rect
          x="16" y="10.5"
          width="7.8" height="7.8"
          transform="rotate(45 16 16)"
          fill="var(--color-surface)"
        />
        <rect
          x="16" y="12"
          width="5.6" height="5.6"
          transform="rotate(45 16 16)"
          fill="var(--color-accent)"
        />

        <circle cx="26" cy="6" r="1.6" fill="var(--color-accent)" fillOpacity="0.9" />
        <circle cx="6" cy="6" r="1.6" fill="var(--color-accent)" fillOpacity="0.6" />
        <circle cx="26" cy="26" r="1.6" fill="var(--color-accent)" fillOpacity="0.6" />
        <circle cx="6" cy="26" r="1.6" fill="var(--color-accent)" fillOpacity="0.9" />
      </svg>
    </div>
  );
}