import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import FadeInSection from "@/components/FadeInSection";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <FileText className="h-10 w-10 mx-auto mb-4 opacity-90" aria-hidden />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Terms of Service</h1>
          <p className="text-primary-foreground/85 max-w-xl mx-auto text-sm">
            Rules and conditions for using Morocco Mosaic&apos;s website and services.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <FadeInSection>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-6 text-sm leading-relaxed">
            <p className="text-foreground font-medium">
              Last updated: April 3, 2026
            </p>
            <p>
              By using this website, you agree to these terms. If you do not agree, please do not use our services.
              Bookings and payments may be subject to additional supplier-specific terms provided at checkout.
            </p>
            <h2 className="font-display text-xl text-foreground mt-8">Use of the site</h2>
            <p>
              You agree to provide accurate information, use the site lawfully, and not attempt to disrupt or misuse our
              systems or other users&apos; experience.
            </p>
            <h2 className="font-display text-xl text-foreground mt-8">Bookings and changes</h2>
            <p>
              Tour availability, pricing, and cancellation policies are confirmed at the time of booking. Changes and
              refunds follow the conditions stated in your booking confirmation and applicable law.
            </p>
            <h2 className="font-display text-xl text-foreground mt-8">Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, Morocco Mosaic is not liable for indirect or consequential losses
              arising from use of the site or travel services, except where such limitation is not allowed.
            </p>
            <p className="pt-4 border-t border-border">
              See also our{" "}
              <Link to="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}
