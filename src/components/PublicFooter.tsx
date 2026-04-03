import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, Facebook, Instagram, Twitter, Youtube, MapPin, Ticket } from "lucide-react";
import { publicApi } from "@/lib/publicApi";
import MoroccoMosaicLogo from "@/components/MoroccoMosaicLogo";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";
import {
  getContactAddressFromSettings,
  getContactEmailFromSettings,
  getContactMailtoFromSettings,
  getContactPhonesFromSettings,
} from "@/lib/siteSettings";
import { SITE_SOCIAL_LINKS } from "@/lib/socialLinks";
import TikTokMark from "@/components/icons/TikTokMark";

/** TripAdvisor logomark (Simple Icons, MIT — simpleicons.org) */
function TripAdvisorMark({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M12.006 4.295c-2.67 0-5.338.784-7.645 2.353H0l1.963 2.135a5.997 5.997 0 0 0 4.04 10.43 5.976 5.976 0 0 0 4.075-1.6L12 19.705l1.922-2.09a5.972 5.972 0 0 0 4.072 1.598 6 6 0 0 0 6-5.998 5.982 5.982 0 0 0-1.957-4.432L24 6.648h-4.35a13.573 13.573 0 0 0-7.644-2.353zM12 6.255c1.531 0 3.063.303 4.504.903C13.943 8.138 12 10.43 12 13.1c0-2.671-1.942-4.962-4.504-5.942A11.72 11.72 0 0 1 12 6.256zM6.002 9.157a4.059 4.059 0 1 1 0 8.118 4.059 4.059 0 0 1 0-8.118zm11.992.002a4.057 4.057 0 1 1 .003 8.115 4.057 4.057 0 0 1-.003-8.115zm-11.992 1.93a2.128 2.128 0 0 0 0 4.256 2.128 2.128 0 0 0 0-4.256zm11.992 0a2.128 2.128 0 0 0 0 4.256 2.128 2.128 0 0 0 0-4.256z"
      />
    </svg>
  );
}

export default function PublicFooter() {
  const { data: categoriesRaw } = useQuery({
    queryKey: ["publicCategories"],
    queryFn: () => publicApi.getCategories(),
    staleTime: 60_000,
  });

  const activityCategories = (categoriesRaw ?? [])
    .map((c) => c.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const { data: siteSettings } = usePublicSiteSettings();
  const contactEmail = getContactEmailFromSettings(siteSettings);
  const contactMailto = getContactMailtoFromSettings(siteSettings);
  const contactPhones = getContactPhonesFromSettings(siteSettings);
  const contactAddress = getContactAddressFromSettings(siteSettings);

  const socialIconByPlatform = {
    facebook: Facebook,
    instagram: Instagram,
    tiktok: TikTokMark,
    x: Twitter,
    youtube: Youtube,
  } as const;

  return (
    <footer className="bg-muted text-foreground border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link 
              to="/" 
              className="inline-flex items-center mb-6 group transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
            >
              <MoroccoMosaicLogo size="sm" variant="full" showTagline={true} className="transition-transform duration-300 group-hover:scale-105" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Curating extraordinary travel experiences that create lasting memories. Explore the world with confidence and style.
            </p>
            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Follow us
              </div>
              <div className="flex gap-3 mt-3">
                {SITE_SOCIAL_LINKS.filter((l) => Boolean(l.href)).map((link) => {
                  const Icon = socialIconByPlatform[link.platform];
                  return (
                    <a
                      key={link.platform}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      title={link.label}
                      className="h-10 w-10 rounded-full bg-background/60 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors border border-border"
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/activities" className="hover:text-foreground transition-colors">
                  Activities
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-foreground transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Activities</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {activityCategories.length > 0 ? (
                activityCategories.map((keyword) => (
                  <li key={keyword}>
                    <Link
                      to={`/activities?search=${encodeURIComponent(keyword)}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {keyword}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link to="/activities" className="hover:text-foreground transition-colors">
                    Browse activities
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary shrink-0" aria-hidden />
                <a
                  href={contactMailto}
                  className="text-foreground underline-offset-4 hover:underline hover:text-primary break-all"
                >
                  {contactEmail}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-secondary shrink-0 mt-0.5" aria-hidden />
                <span className="flex flex-col gap-1">
                  {contactPhones.map((p) => (
                    <a
                      key={`${p.telHref}-${p.display}`}
                      href={p.telHref}
                      className="text-foreground underline-offset-4 hover:underline hover:text-primary"
                    >
                      {p.display}
                    </a>
                  ))}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-secondary shrink-0 mt-0.5" aria-hidden />
                <span className="text-foreground">{contactAddress}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2026 Morocco Mosaic. All rights reserved. Realised by Meryem Boujja.
          </p>
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end sm:flex-wrap">
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://www.viator.com/tours/Marrakech/Morocco-desert-tour-from-Marrakech-3-days-including-camel-trek/d5408-64126P9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#592D84] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4a2470] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#592D84]"
              >
                <Ticket className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
                <span>Viator</span>
              </a>
              <a
                href="https://www.tripadvisor.com/Attraction_Review-g293734-d3404703-Reviews-Tour_in_Morocco_Day_Tours-Marrakech_Marrakech_Safi.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-[#00AA6C]/40 hover:bg-[#00AA6C]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00AA6C]"
              >
                <TripAdvisorMark className="h-8 w-8 shrink-0 text-[#00AA6C]" />
                <span className="text-foreground">TripAdvisor</span>
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground sm:border-l sm:border-border sm:pl-4">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
