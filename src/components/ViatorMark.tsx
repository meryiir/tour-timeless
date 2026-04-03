/** Compact Viator-style mark (green tile + V) for review attribution. */
export default function ViatorMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="24" height="24" rx="5" fill="#00AA6C" />
      <path fill="#fff" d="M12 6.2 6.8 17.8h2.6l1.1-3.2h3l1.1 3.2h2.6L13.4 6.2h-2.8z" />
    </svg>
  );
}
