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
  noIndex?: boolean;
  type?: "website" | "article";
}

export function Seo({
  title,
  description,
  canonicalPath,
  imageUrl,
  noIndex,
  type = "website",
}: SeoProps) {
  const { pathname, search } = useLocation();
  const base = getSitePublicUrl();

  const canonical =
    canonicalPath != null
      ? absoluteUrl(canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`)
      : `${base}${pathname}${search}`;

  const resolveOgImage = (): string | undefined => {
    if (!imageUrl?.trim()) return undefined;
    const u = imageUrl.trim();
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    const path = u.startsWith("/") ? u : `/${u}`;
    return `${base}${path}`;
  };

  const ogImage = resolveOgImage();

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
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
