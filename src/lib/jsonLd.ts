import { absoluteUrl, getSitePublicUrl } from "@/lib/siteUrl";

export function buildOrganization(params: {
  name: string;
  url: string;
  description?: string;
  logoUrl?: string;
}): Record<string, unknown> {
  const base = params.url.replace(/\/$/, "");
  const o: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: params.name,
    url: base,
    "@id": `${base}#organization`,
  };
  if (params.description) o.description = params.description;
  if (params.logoUrl) {
    const logo = params.logoUrl.startsWith("http")
      ? params.logoUrl
      : absoluteUrl(params.logoUrl.startsWith("/") ? params.logoUrl : `/${params.logoUrl}`);
    o.logo = { "@type": "ImageObject", url: logo };
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
    "@id": `${base}#website`,
    publisher: {
      "@type": "Organization",
      name: params.name,
      url: base,
      "@id": `${base}#organization`,
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

export function buildWebPage(params: {
  name: string;
  description?: string;
  url: string;
  /** Defaults to WebPage. Use CollectionPage for listings. */
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
  /** Connect page to the WebSite entity id. */
  isPartOfWebSiteUrl?: string;
}): Record<string, unknown> {
  const o: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": params.type ?? "WebPage",
    name: params.name,
    url: params.url,
    "@id": `${params.url}#webpage`,
  };
  if (params.description) o.description = params.description.slice(0, 5000);
  if (params.isPartOfWebSiteUrl) {
    const base = params.isPartOfWebSiteUrl.replace(/\/$/, "");
    o.isPartOf = { "@id": `${base}#website` };
  }
  return o;
}

export function buildItemList(params: {
  name: string;
  url: string;
  itemUrls: string[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: params.name,
    url: params.url,
    itemListElement: params.itemUrls.map((u, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: u,
    })),
  };
}

export function buildFAQPage(params: {
  url: string;
  questions: { question: string; answer: string }[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${params.url}#faq`,
    mainEntity: params.questions
      .filter((q) => q.question.trim() && q.answer.trim())
      .map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.answer,
        },
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
    "@id": `${params.url}#touristTrip`,
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

/**
 * Product schema tends to be the most consistently eligible for rich results (price/ratings),
 * when you have real offers + aggregated ratings.
 */
export function buildActivityProduct(params: {
  name: string;
  description: string;
  url: string;
  image?: string;
  brandName: string;
  price?: number;
  priceCurrency?: string;
  ratingAverage?: number;
  reviewCount?: number;
}): Record<string, unknown> {
  const base = getSitePublicUrl();
  const o: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: params.name,
    description: params.description.slice(0, 5000),
    url: params.url,
    "@id": `${params.url}#product`,
    brand: {
      "@type": "Organization",
      name: params.brandName,
      "@id": `${base}#organization`,
    },
  };
  if (params.image) o.image = params.image;

  if (params.price != null && params.priceCurrency) {
    o.offers = {
      "@type": "Offer",
      price: String(params.price),
      priceCurrency: params.priceCurrency,
      availability: "https://schema.org/InStock",
      url: params.url,
    };
  }

  if (
    params.ratingAverage != null &&
    Number.isFinite(params.ratingAverage) &&
    params.reviewCount != null &&
    Number.isFinite(params.reviewCount) &&
    params.reviewCount > 0
  ) {
    o.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(params.ratingAverage),
      reviewCount: String(params.reviewCount),
      bestRating: "5",
      worstRating: "1",
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
    "@id": `${params.url}#touristDestination`,
  };
  if (params.image) o.image = params.image;
  return o;
}

export function defaultLogoAbsoluteUrl(): string {
  return `${getSitePublicUrl()}/logo.png`;
}
