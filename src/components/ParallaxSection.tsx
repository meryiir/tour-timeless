import { ReactNode } from "react";

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number; // Kept for compatibility but not used
  zIndex?: number; // Z-index for layering
}

export default function ParallaxSection({ 
  children, 
  className = "", 
  speed = 0.5,
  zIndex = 1 
}: ParallaxSectionProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        zIndex,
      }}
    >
      {children}
    </div>
  );
}
