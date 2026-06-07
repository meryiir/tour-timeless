import type { TFunction } from "i18next";
import {
  SITE_CONTACT_ADDRESS,
  SITE_CONTACT_EMAIL,
  SITE_CONTACT_PHONES,
  SITE_HEADER_PHONE,
} from "@/lib/siteContact";

/** Mirrors public GET /api/settings response fields used on the site. */
export interface PublicSiteSettings {
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  mapEmbedUrl?: string | null;
  contactPhonesJson?: string | null;
  businessHours?: string | null;
  aboutContentJson?: string | null;
}

/** Normalize JSON from Spring (camelCase) or odd proxies / snake_case. */
export function normalizePublicSiteSettings(raw: unknown): PublicSiteSettings {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const str = (camel: string, snake: string): string | null | undefined => {
    const v = r[camel] ?? r[snake];
    if (v == null) return undefined;
    if (typeof v === "string") return v;
    return String(v);
  };
  return {
    contactEmail: str("contactEmail", "contact_email"),
    contactPhone: str("contactPhone", "contact_phone"),
    address: str("address", "address"),
    mapEmbedUrl: str("mapEmbedUrl", "map_embed_url"),
    contactPhonesJson: str("contactPhonesJson", "contact_phones_json"),
    businessHours: str("businessHours", "business_hours"),
    aboutContentJson: str("aboutContentJson", "about_content_json"),
  };
}

export type ContactPhoneLine = { display: string; telHref: string };

/** DB / admin may still contain old demo copy — ignore it and use {@link SITE_CONTACT_EMAIL} etc. */
function isDemoContactEmail(value: string): boolean {
  const t = value.trim().toLowerCase();
  if (!t) return true;
  return (
    t === "info@tourtimeless.com" ||
    t === "hello@wanderlust.com" ||
    t.endsWith("@example.com") ||
    t.endsWith("@test.com")
  );
}

function isDemoAddress(value: string): boolean {
  const t = value.trim().toLowerCase();
  if (!t) return true;
  return (
    t.includes("123 tourism") ||
    t.includes("travel street") ||
    t.includes("new york, ny") ||
    (t.includes("marrakech") && t.includes("123 ") && t.includes("street"))
  );
}

/** Masked placeholders like "+212 6XX XXX XXX". */
function isDemoPhoneDisplay(value: string): boolean {
  const t = value.trim();
  if (!t) return true;
  if (/6xx/i.test(t)) return true;
  if (/xxx/i.test(t) && (/\+?212|[+]?\d{2,3}/.test(t) || t.includes("+"))) return true;
  return false;
}

function digitsToTelHref(display: string): string {
  const digits = display.replace(/\D/g, "");
  if (!digits) return `tel:${display.trim()}`;
  return `tel:+${digits.replace(/^\+/, "")}`;
}

function phoneRowDisplay(row: object): string {
  const r = row as Record<string, unknown>;
  for (const key of ["display", "Display", "label", "phone", "number"]) {
    const v = r[key];
    if (v != null) {
      const s = String(v).trim();
      if (s) return s;
    }
  }
  return "";
}

function phoneRowTel(row: object, display: string): string {
  const r = row as Record<string, unknown>;
  for (const key of ["tel", "Tel", "href"]) {
    const v = r[key];
    if (typeof v === "string" && v.trim()) {
      const t = v.trim();
      if (t.startsWith("tel:")) return t;
      return digitsToTelHref(t);
    }
  }
  return digitsToTelHref(display);
}

/** Resolve phone lines from API settings, with fallbacks to static defaults. */
export function getContactPhonesFromSettings(s: PublicSiteSettings | undefined): readonly ContactPhoneLine[] {
  const raw = s?.contactPhonesJson?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const out: ContactPhoneLine[] = [];
        for (const row of parsed) {
          if (row && typeof row === "object") {
            const display = phoneRowDisplay(row);
            if (!display) continue;
            out.push({ display, telHref: phoneRowTel(row, display) });
          }
        }
        if (out.length > 0) {
          if (out.some((p) => isDemoPhoneDisplay(p.display))) {
            return SITE_CONTACT_PHONES;
          }
          return out;
        }
      }
    } catch {
      /* fall through */
    }
  }
  const combined = s?.contactPhone?.trim();
  if (combined) {
    if (isDemoPhoneDisplay(combined)) {
      return SITE_CONTACT_PHONES;
    }
    const parts = combined
      .split(/\||\n|;|,/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      if (parts.some((p) => isDemoPhoneDisplay(p))) {
        return SITE_CONTACT_PHONES;
      }
      return parts.map((display) => ({ display, telHref: digitsToTelHref(display) }));
    }
  }
  return SITE_CONTACT_PHONES;
}

const HEADER_PHONE_DIGITS = "212721104528";

function isHeaderPhoneLine(line: ContactPhoneLine): boolean {
  const digits = line.telHref.replace(/\D/g, "") || line.display.replace(/\D/g, "");
  return digits.endsWith(HEADER_PHONE_DIGITS);
}

/** Morocco line for the top header bar (not necessarily the first contact list entry). */
export function getHeaderPhoneFromSettings(s: PublicSiteSettings | undefined): ContactPhoneLine {
  const phones = getContactPhonesFromSettings(s);
  return phones.find(isHeaderPhoneLine) ?? SITE_HEADER_PHONE;
}

export function getContactEmailFromSettings(s: PublicSiteSettings | undefined): string {
  const raw = (s?.contactEmail?.trim() || "").trim();
  if (!raw || /^null$/i.test(raw) || raw === "undefined" || isDemoContactEmail(raw)) {
    return SITE_CONTACT_EMAIL;
  }
  return raw;
}

export function getContactMailtoFromSettings(s: PublicSiteSettings | undefined): string {
  return `mailto:${getContactEmailFromSettings(s)}`;
}

export function getContactAddressFromSettings(s: PublicSiteSettings | undefined): string {
  const raw = (s?.address?.trim() || "").trim();
  if (!raw || isDemoAddress(raw)) {
    return SITE_CONTACT_ADDRESS;
  }
  return raw;
}

export function getBusinessHoursFromSettings(s: PublicSiteSettings | undefined, t: TFunction): string {
  const h = s?.businessHours?.trim();
  if (h) return h;
  return t("contact.defaultHours");
}

/** Optional JSON overrides for the About page (admin CMS). */
export interface AboutContentOverrides {
  heroBadge?: string;
  heroTitle?: string;
  trustedPartner?: string;
  missionLead?: string;
  storyKicker?: string;
  storyHeading?: string;
  storyText1?: string;
  storyText2?: string;
  experienceSubtitle?: string;
  valuesIntro?: string;
  values?: { title: string; desc: string }[];
  inspireQuote?: string;
  inspireAttribution?: string;
  stats?: { num: string; label: string }[];
  ctaTitle?: string;
  ctaSubtitle?: string;
}

export function parseAboutContentJson(json: string | null | undefined): AboutContentOverrides | null {
  if (!json?.trim()) return null;
  try {
    const o = JSON.parse(json) as unknown;
    if (o && typeof o === "object") return o as AboutContentOverrides;
  } catch {
    /* ignore */
  }
  return null;
}
