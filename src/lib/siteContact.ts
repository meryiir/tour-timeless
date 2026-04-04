export const SITE_CONTACT_EMAIL = "tourinmorocco.contact@gmail.com";

/** Morocco office lines — display text and tel: link (digits + leading +). Primary line first (header / single-line fallbacks). */
export const SITE_CONTACT_PHONES: readonly { display: string; telHref: string }[] = [
  { display: "+212 659-915763", telHref: "tel:+212659915763" },
  { display: "+212 617-771275", telHref: "tel:+212617771275" },
  { display: "+212 650-509930", telHref: "tel:+212650509930" },
] as const;

/** First number — for single-line fallbacks. */
export const SITE_CONTACT_PHONE_DISPLAY = SITE_CONTACT_PHONES[0].display;
export const SITE_CONTACT_PHONE_TEL = "+212659915763";
export const siteContactTel = `tel:${SITE_CONTACT_PHONE_TEL}`;

export const siteContactMailto = `mailto:${SITE_CONTACT_EMAIL}`;

export const SITE_CONTACT_ADDRESS = "Rue Erraouda, 40000 Marrakesh Morocco";

/** WhatsApp chat link — dedicated line (+212 659-915763). `wa.me` uses digits only, no +. */
export const SITE_WHATSAPP_E164_DIGITS = "212659915763";
export const SITE_WHATSAPP_CHAT_URL = `https://wa.me/${SITE_WHATSAPP_E164_DIGITS}`;

/** Featured listing on Viator (same tour as footer / home). */
export const SITE_VIATOR_LISTING_URL =
  "https://www.viator.com/tours/Marrakech/Morocco-desert-tour-from-Marrakech-3-days-including-camel-trek/d5408-64126P9";
