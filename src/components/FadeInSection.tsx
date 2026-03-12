import { ReactNode } from "react";

export default function FadeInSection({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
