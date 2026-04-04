import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import FadeInSection from "@/components/FadeInSection";
import { Seo } from "@/components/seo/Seo";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";

export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Seo title={t("seo.privacy.title")} description={t("seo.privacy.description")} canonicalPath="/privacy" />
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <PageBreadcrumb
            items={[
              { label: t("nav.home"), to: "/" },
              { label: t("breadcrumb.privacy") },
            ]}
            currentPath="/privacy"
            variant="overlay"
            overlayTone="primary"
            className="mb-6"
          />
          <div className="text-center">
            <Shield className="h-10 w-10 mx-auto mb-4 opacity-90" aria-hidden />
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Privacy Policy</h1>
            <p className="text-primary-foreground/85 max-w-xl mx-auto text-sm">
              How Morocco Mosaic collects, uses, and protects your information.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <FadeInSection>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-6 text-sm leading-relaxed">
            <p className="text-foreground font-medium">
              Last updated: April 3, 2026
            </p>
            <p>
              We respect your privacy. This policy describes what information we may collect when you use our website,
              how we use it, and your choices. For questions, contact us via our{" "}
              <Link to="/contact" className="text-primary hover:underline font-medium">
                contact page
              </Link>
              .
            </p>
            <h2 className="font-display text-xl text-foreground mt-8">Information we collect</h2>
            <p>
              We may collect information you provide directly (such as name, email, and booking details) and technical
              data such as browser type and approximate location, to operate and improve our services.
            </p>
            <h2 className="font-display text-xl text-foreground mt-8">How we use information</h2>
            <p>
              We use this information to process bookings, respond to inquiries, send service-related communications,
              and improve our website and offerings in line with applicable law.
            </p>
            <h2 className="font-display text-xl text-foreground mt-8">Your rights</h2>
            <p>
              Depending on where you live, you may have rights to access, correct, or delete your personal data. Contact
              us and we will respond within a reasonable time.
            </p>
            <p className="pt-4 border-t border-border">
              See also our{" "}
              <Link to="/terms" className="text-primary hover:underline font-medium">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}
