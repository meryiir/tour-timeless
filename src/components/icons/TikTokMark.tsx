type Props = { className?: string };

/** TikTok logomark (Simple Icons, CC0 — simpleicons.org) */
export default function TikTokMark({ className }: Props) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.253V2h-3.998v13.501a2.996 2.996 0 1 1-2.996-2.996c.285 0 .563.04.83.1V8.57a7.02 7.02 0 0 0-.83-.05A6.996 6.996 0 1 0 15.82 15.5V9.454a8.78 8.78 0 0 0 3.77.85V6.686z"
      />
    </svg>
  );
}

