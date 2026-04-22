import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { absoluteUrl, getSitePublicUrl } from "@/lib/siteUrl";

export interface SeoProps {
  title: string;
  description: string;
  /** Path starting with `/`, e.g. `/activities/my-tour` */
  canonicalPath?: string;
  /** Absolute or site-relative image URL for og:image */
  imageUrl?: string;
  /** Comma-separated keywords or a list of keyword phrases. */
  keywords?: string | string[];
  noIndex?: boolean;
  type?: "website" | "article";
}

const DEFAULT_KEYWORDS: string[] = [
  "Morocco tours",
  "Morocco travel",
  "Morocco private tours",
  "Marrakech tours",
  "Sahara desert tour",
  "Merzouga desert",
  "Fes tours",
  "Atlas Mountains day trip",
  "Morocco itinerary",
  "Morocco activities",
];

function normalizeKeywords(input?: string | string[]): string | undefined {
  if (input == null) return undefined;
  const list = Array.isArray(input) ? input : input.split(",");
  const cleaned = list
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i);
  return cleaned.length ? cleaned.join(", ") : undefined;
}

export function Seo({
  title,
  description,
  canonicalPath,
  imageUrl,
  keywords,
  noIndex,
  type = "website",
}: SeoProps) {
  const { pathname, search } = useLocation();
  const base = getSitePublicUrl();

  const supportedLangs = ["en", "fr", "es", "de"] as const;

  const canonicalBase =
    canonicalPath != null
      ? absoluteUrl(canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`)
      : `${base}${pathname}`;

  // Canonical = clean URL without query params (Google best practice).
  // hreflang alternates carry the ?lang=XX param so each language variant is indexable.
  const canonical = canonicalBase;
  const hreflangBase = new URLSearchParams(search);

  const resolveOgImage = (): string | undefined => {
    if (!imageUrl?.trim()) return undefined;
    const u = imageUrl.trim();
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    const path = u.startsWith("/") ? u : `/${u}`;
    return `${base}${path}`;
  };

  const ogImage = resolveOgImage();
  const keywordsContent = normalizeKeywords(keywords) ?? DEFAULT_KEYWORDS.join(", ");
  const googleSiteVerification = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION?.trim();

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsContent} />
      {googleSiteVerification ? (
        <meta name="google-site-verification" content={googleSiteVerification} />
      ) : null}
      <link rel="canonical" href={canonical} />
      {/* hreflang alternates — each language version carries ?lang=XX */}
      {supportedLangs.map((lang) => {
        const p = new URLSearchParams(hreflangBase);
        p.set("lang", lang);
        return <link key={lang} rel="alternate" hrefLang={lang} href={`${canonicalBase}?${p.toString()}`} />;
      })}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${canonicalBase}?${new URLSearchParams({ ...Object.fromEntries(hreflangBase), lang: "en" }).toString()}`}
      />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
