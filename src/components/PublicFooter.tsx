import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold mb-4">
              <MapPin className="h-6 w-6 text-secondary" />
              Wanderlust
            </Link>
            <p className="text-sm opacity-70 leading-relaxed">
              Curating extraordinary travel experiences that create lasting memories. Explore the world with confidence and style.
            </p>
            <div className="flex gap-3 mt-6">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm opacity-70">
              {["Activities", "Destinations", "About Us", "Contact"].map((t) => (
                <li key={t}><Link to={`/${t.toLowerCase().replace(" ", "-")}`} className="hover:opacity-100 transition-opacity">{t}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm opacity-70">
              {["Adventure", "Water Sports", "Cultural", "Luxury", "Wildlife"].map((t) => (
                <li key={t}><a href="#" className="hover:opacity-100 transition-opacity">{t}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm opacity-70">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-secondary" />hello@wanderlust.com</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-secondary" />+1 (555) 123-4567</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-secondary" />123 Travel Street, NYC</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center text-sm opacity-50">
          <p>© 2026 Wanderlust. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
