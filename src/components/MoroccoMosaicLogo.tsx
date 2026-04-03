import React from "react";

interface MoroccoMosaicLogoProps {
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "full" | "compact";
}

export default function MoroccoMosaicLogo({
  className = "",
  showText = true,
  showTagline = false,
  size = "md",
  variant = "full"
}: MoroccoMosaicLogoProps) {

  const sizeClasses = {
    sm: {
      icon: "w-24",
      text: "text-sm",
      tagline: "text-[9px]",
      gap: "gap-2.5",
      textGap: "gap-1"
    },
    md: {
      icon: "w-36",
      text: "text-base",
      tagline: "text-[10px]",
      gap: "gap-3",
      textGap: "gap-1.5"
    },
    lg: {
      icon: "w-48",
      text: "text-lg",
      tagline: "text-xs",
      gap: "gap-3.5",
      textGap: "gap-2"
    }
  };

  const currentSize = sizeClasses[size];

  // Compact version (Navbar)
  if (variant === "compact") {
    return (
      <div className={`flex items-center ${currentSize.gap} ${className}`}>

        <img
          src="/logo.png"
          alt="Morocco Mosaic Logo"
          className="w-10 h-10 object-contain rounded-md"
        />

        {showText && (
          <div className="flex flex-col">
            <span
              className={`${currentSize.text} font-serif font-bold leading-none text-[#5D4037] dark:text-white transition-colors`}
            >
              Morocco
            </span>
            <span
              className={`${currentSize.text} font-serif font-bold leading-none text-[#C9A068] dark:text-[#D4A574] transition-colors`}
            >
              Mosaic
            </span>
          </div>
        )}

      </div>
    );
  }

  // Full version
  return (
    <div className={`flex flex-col items-center ${currentSize.gap} ${className}`}>

      <img
        src="/logo.png"
        alt="Morocco Mosaic Logo"
        className={`${currentSize.icon} h-auto object-contain`}
      />

      {showText && (
        <div className={`flex flex-col items-center ${currentSize.textGap}`}>

          <div className={`flex flex-col items-center ${currentSize.text} font-serif font-bold leading-tight`}>
            <span className="text-[#5D4037] dark:text-white transition-colors">
              Morocco
            </span>
            <span className="text-[#C9A068] dark:text-[#D4A574] transition-colors">
              Mosaic
            </span>
          </div>

          {showTagline && (
            <div className={`${currentSize.tagline} font-sans font-light text-[#8B6F47] dark:text-[#A0826D] tracking-wider uppercase`}>
              DISCOVER THE BEAUTY
            </div>
          )}

        </div>
      )}

    </div>
  );
}