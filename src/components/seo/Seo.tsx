import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { absoluteUrl, getSitePublicUrl } from "@/lib/siteUrl";
import { useTranslation } from "react-i18next";

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
  const { i18n } = useTranslation();
  const base = getSitePublicUrl();

  const supportedLangs = ["en", "fr", "es", "de"] as const;
  const currentLang = supportedLangs.includes(i18n.language as (typeof supportedLangs)[number])
    ? (i18n.language as (typeof supportedLangs)[number])
    : "en";

  const canonicalBase =
    canonicalPath != null
      ? absoluteUrl(canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`)
      : `${base}${pathname}`;

  // Always preserve `lang` param so each language has a stable indexable URL.
  const canonicalParams = new URLSearchParams(search);
  canonicalParams.set("lang", canonicalParams.get("lang") || currentLang);
  const canonical = `${canonicalBase}?${canonicalParams.toString()}`;

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
      {/* hreflang alternates (query-param based) */}
      {supportedLangs.map((lang) => {
        const p = new URLSearchParams(canonicalParams);
        p.set("lang", lang);
        return <link key={lang} rel="alternate" hrefLang={lang} href={`${canonicalBase}?${p.toString()}`} />;
      })}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${canonicalBase}?${new URLSearchParams({ ...Object.fromEntries(canonicalParams), lang: "en" }).toString()}`}
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
