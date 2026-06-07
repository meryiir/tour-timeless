export const SITE_CONTACT_EMAIL = "tourinmorocco.contact@gmail.com";

/** Shown in the top header bar. */
export const SITE_HEADER_PHONE = {
  display: "+212721104528",
  telHref: "tel:+212721104528",
} as const;

/** All public contact lines (contact page, footer, etc.). */
export const SITE_CONTACT_PHONES: readonly { display: string; telHref: string }[] = [
  { display: "+16086504232", telHref: "tel:+16086504232" },
  { display: "+212721104528", telHref: "tel:+212721104528" },
] as const;

/** First number — for single-line fallbacks. */
export const SITE_CONTACT_PHONE_DISPLAY = SITE_HEADER_PHONE.display;
export const SITE_CONTACT_PHONE_TEL = "+212721104528";
export const siteContactTel = `tel:${SITE_CONTACT_PHONE_TEL}`;

export const siteContactMailto = `mailto:${SITE_CONTACT_EMAIL}`;

export const SITE_CONTACT_ADDRESS = "Rue Erraouda, 40000 Marrakesh Morocco";

/** WhatsApp chat link — `wa.me` uses digits only, no +. */
export const SITE_WHATSAPP_E164_DIGITS = "212721104528";
export const SITE_WHATSAPP_CHAT_URL = `https://wa.me/${SITE_WHATSAPP_E164_DIGITS}`;

/** Featured listing on Viator (same tour as footer / home). */
export const SITE_VIATOR_LISTING_URL =
  "https://www.viator.com/tours/Marrakech/Morocco-desert-tour-from-Marrakech-3-days-including-camel-trek/d5408-64126P9";
