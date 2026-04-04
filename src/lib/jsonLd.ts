import { absoluteUrl, getSitePublicUrl } from "@/lib/siteUrl";

export function buildOrganization(params: {
  name: string;
  url: string;
  description?: string;
  logoUrl?: string;
}): Record<string, unknown> {
  const o: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: params.name,
    url: params.url,
  };
  if (params.description) o.description = params.description;
  if (params.logoUrl) {
    o.logo = params.logoUrl.startsWith("http")
      ? params.logoUrl
      : absoluteUrl(params.logoUrl.startsWith("/") ? params.logoUrl : `/${params.logoUrl}`);
  }
  return o;
}

export function buildWebSite(params: {
  name: string;
  url: string;
  description?: string;
}): Record<string, unknown> {
  const base = params.url.replace(/\/$/, "");
  const o: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: params.name,
    url: base,
    publisher: {
      "@type": "Organization",
      name: params.name,
      url: base,
    },
  };
  if (params.description) o.description = params.description;
  o.potentialAction = {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${base}/activities?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  };
  return o;
}

export function buildBreadcrumbList(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** TouristTrip + Offer for tour / activity detail pages. */
export function buildTouristTrip(params: {
  name: string;
  description: string;
  url: string;
  image?: string;
  price?: number;
  priceCurrency?: string;
  duration?: string;
}): Record<string, unknown> {
  const o: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: params.name,
    description: params.description.slice(0, 5000),
    url: params.url,
  };
  if (params.image) o.image = params.image;
  if (params.duration) o.duration = params.duration;
  if (params.price != null && params.priceCurrency) {
    o.offers = {
      "@type": "Offer",
      price: String(params.price),
      priceCurrency: params.priceCurrency,
      availability: "https://schema.org/InStock",
      url: params.url,
    };
  }
  return o;
}

export function buildPlace(params: {
  name: string;
  description: string;
  url: string;
  image?: string;
}): Record<string, unknown> {
  const o: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: params.name,
    description: params.description.slice(0, 5000),
    url: params.url,
  };
  if (params.image) o.image = params.image;
  return o;
}

export function defaultLogoAbsoluteUrl(): string {
  return `${getSitePublicUrl()}/logo.png`;
}
