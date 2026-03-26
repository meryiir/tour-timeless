import React from "react";

interface TravelQuestLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact";
}

export default function TravelQuestLogo({ 
  className = "", 
  showText = true,
  size = "md",
  variant = "default"
}: TravelQuestLogoProps) {
  const sizeClasses = {
    sm: { icon: "h-9 w-9", text: "text-base", gap: "gap-2.5", base: "h-1.5" },
    md: { icon: "h-11 w-11", text: "text-xl", gap: "gap-3", base: "h-2" },
    lg: { icon: "h-14 w-14", text: "text-2xl", gap: "gap-3.5", base: "h-2.5" },
  };

  const currentSize = sizeClasses[size];
  const uniqueId = `logo-${size}-${showText}`;
  const isCompact = variant === "compact";

  return (
    <div className={`flex items-center ${currentSize.gap} ${className}`}>
      {/* Logo Container */}
      <div className="relative flex-shrink-0">
        {/* Circular Icon */}
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize.icon} flex-shrink-0`}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Travel Quest Logo"
        >
          {/* Circular Border - Thin orange */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="#F97316"
            strokeWidth="1.2"
            className="dark:stroke-[#FB923C]"
          />

          {/* Sky Background - Light peachy-cream */}
          <circle cx="50" cy="50" r="46" fill="#FFF8F0" className="dark:fill-[#1F2937]" />

          {/* Sun/Moon - Small orange circle in upper right */}
          <circle cx="72" cy="28" r="3.5" fill="#F97316" className="dark:fill-[#FB923C]" />

          {/* Sand Dunes - Layered undulating shapes */}
          {/* First layer */}
          <path
            d="M 10 70 Q 25 60, 40 70 T 70 70 T 90 70 L 90 96 L 10 96 Z"
            fill="#FED7AA"
            className="dark:fill-[#92400E]"
          />
          {/* Second layer */}
          <path
            d="M 15 80 Q 30 70, 45 80 T 75 80 T 85 80 L 85 96 L 15 96 Z"
            fill="#FDBA74"
            className="dark:fill-[#B45309]"
          />
          {/* Third layer */}
          <path
            d="M 20 85 Q 35 75, 50 85 T 80 85 L 80 96 L 20 96 Z"
            fill="#F97316"
            fillOpacity="0.6"
            className="dark:fill-[#D97706] dark:opacity-70"
          />

          {/* Buildings - Two abstract squares with thin orange outlines */}
          {/* First building (left) - darker peachy-orange fill */}
          <rect
            x="38"
            y="50"
            width="11"
            height="11"
            fill="#FED7AA"
            stroke="#F97316"
            strokeWidth="0.8"
            transform="rotate(-5 43.5 55.5)"
            className="dark:fill-[#92400E] dark:stroke-[#FB923C]"
          />
          {/* Second building (right) - lighter fill */}
          <rect
            x="52"
            y="48"
            width="11"
            height="11"
            fill="#FFF8F0"
            stroke="#F97316"
            strokeWidth="0.8"
            transform="rotate(8 57.5 53.5)"
            className="dark:fill-[#1F2937] dark:stroke-[#FB923C]"
          />

          {/* Rock/Dwelling - Small dark brown rounded shape */}
          <ellipse
            cx="68"
            cy="75"
            rx="3"
            ry="4"
            fill="#78350F"
            className="dark:fill-[#451A03]"
          />
        </svg>

        {/* Rectangular Base - Dark brown, extends below circle */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 top-full mt-0.5 ${currentSize.base} w-12 bg-[#78350F] rounded-sm dark:bg-[#451A03]`}
          style={{ width: `${parseInt(currentSize.icon) * 0.7}px` }}
        />
      </div>

      {/* Text - Vibrant orange, bold sans-serif */}
      {showText && (
        <div className={`flex flex-col ${currentSize.text} font-display font-bold leading-[1.1] tracking-tight`}>
          <span className="text-[#F97316] dark:text-[#FB923C] transition-colors">
            Travel
          </span>
          <span className="text-[#F97316] dark:text-[#FB923C] transition-colors">
            Quest
          </span>
        </div>
      )}
    </div>
  );
}
