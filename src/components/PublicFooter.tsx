import { Link } from "react-router-dom";
import { Mail, Phone, Facebook, Instagram, Twitter, Youtube, MapPin } from "lucide-react";
import MoroccoMosaicLogo from "@/components/MoroccoMosaicLogo";
import {
  SITE_CONTACT_EMAIL,
  SITE_CONTACT_PHONE_DISPLAY,
  siteContactMailto,
  siteContactTel,
} from "@/lib/siteContact";

export default function PublicFooter() {
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
            <div className="flex gap-3 mt-6">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors border border-border">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["Activities", "Destinations", "About Us", "Contact"].map((t) => (
                <li key={t}><Link to={`/${t.toLowerCase().replace(" ", "-")}`} className="hover:text-foreground transition-colors">{t}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["Adventure", "Water Sports", "Cultural", "Luxury", "Wildlife"].map((t) => (
                <li key={t}><a href="#" className="hover:text-foreground transition-colors">{t}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary shrink-0" aria-hidden />
                <a href={siteContactMailto} className="hover:text-foreground underline-offset-4 hover:underline">
                  {SITE_CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary shrink-0" aria-hidden />
                <a href={siteContactTel} className="hover:text-foreground underline-offset-4 hover:underline">
                  {SITE_CONTACT_PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-secondary" />123 Travel Street, NYC</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© 2026 Wanderlust. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
