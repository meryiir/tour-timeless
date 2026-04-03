export type SocialPlatform = "facebook" | "instagram" | "tiktok" | "x" | "youtube";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  href: string;
};

/**
 * Fill in your real social URLs here.
 * Any item with an empty `href` will be hidden from the UI.
 */
export const SITE_SOCIAL_LINKS: readonly SocialLink[] = [
  { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/Tourinmorocco4x4/" },
  { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/morocco_mosaic_/" },
  { platform: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@morocco.mosaic6?_r=1&_t=ZS-95BHk4ZLsLU" },
  { platform: "x", label: "X (Twitter)", href: "" },
  { platform: "youtube", label: "YouTube", href: "" },
] as const;

