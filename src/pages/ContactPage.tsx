import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FadeInSection from "@/components/FadeInSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { publicApi } from "@/lib/publicApi";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";
import {
  getContactAddressFromSettings,
  getContactEmailFromSettings,
  getContactMailtoFromSettings,
  getContactPhonesFromSettings,
  getBusinessHoursFromSettings,
} from "@/lib/siteSettings";

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: siteSettings } = usePublicSiteSettings();
  const contactEmail = getContactEmailFromSettings(siteSettings);
  const contactMailto = getContactMailtoFromSettings(siteSettings);
  const contactPhones = getContactPhonesFromSettings(siteSettings);
  const contactAddress = getContactAddressFromSettings(siteSettings);
  const businessHours = getBusinessHoursFromSettings(siteSettings, t);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      subject: "",
      message: "",
    });
  }, [user, reset]);

  const faqs = [
    { q: t("contact.faqBook"), a: t("contact.faqBookAnswer") },
    { q: t("contact.faqCancel"), a: t("contact.faqCancelAnswer") },
    { q: t("contact.faqChildren"), a: t("contact.faqChildrenAnswer") },
    { q: t("contact.faqInsurance"), a: t("contact.faqInsuranceAnswer") },
    { q: t("contact.faqGuide"), a: t("contact.faqGuideAnswer") },
  ];

  const onSubmit = async (data: ContactFormData) => {
    try {
      await publicApi.submitContactMessage({
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject.trim(),
        message: data.message.trim(),
      });
      toast({
        title: t("contact.sent"),
        description: t("contact.sentToAdmin"),
      });
      reset({
        name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
        email: user?.email ?? "",
        subject: "",
        message: "",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("contact.sendFailed"),
        description: err instanceof Error ? err.message : t("contact.sendFailed"),
      });
    }
  };

  return (
    <div className="py-12">
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">{t("contact.title")}</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">{t("contact.haveQuestion")}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-20">
          <FadeInSection>
            <h2 className="font-display text-2xl font-bold mb-6">{t("contact.sendMessage")}</h2>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    id="contact-name"
                    autoComplete="name"
                    placeholder={t("contact.yourName")}
                    aria-invalid={!!errors.name}
                    {...register("name", { required: t("contact.fillAllFields") })}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    placeholder={t("contact.yourEmail")}
                    aria-invalid={!!errors.email}
                    {...register("email", {
                      required: t("contact.fillAllFields"),
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: t("contact.invalidEmail"),
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Input
                  id="contact-subject"
                  autoComplete="off"
                  placeholder={t("contact.subject")}
                  aria-invalid={!!errors.subject}
                  {...register("subject", { required: t("contact.fillAllFields") })}
                />
                {errors.subject && (
                  <p className="text-sm text-destructive mt-1" role="alert">
                    {errors.subject.message}
                  </p>
                )}
              </div>
              <div>
                <Textarea
                  id="contact-message"
                  placeholder={t("contact.yourMessage")}
                  className="min-h-[150px]"
                  aria-invalid={!!errors.message}
                  {...register("message", { required: t("contact.fillAllFields") })}
                />
                {errors.message && (
                  <p className="text-sm text-destructive mt-1" role="alert">
                    {errors.message.message}
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? t("contact.sending") : t("contact.send")}
              </Button>
            </form>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <h2 className="font-display text-2xl font-bold mb-6">{t("contact.getInTouch")}</h2>
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{t("contact.emailLabel")}</p>
                  <a
                    href={contactMailto}
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{t("contact.phoneLabel")}</p>
                  <div className="flex flex-col gap-1 mt-0.5">
                    {contactPhones.map((p) => (
                      <a
                        key={p.telHref + p.display}
                        href={p.telHref}
                        className="text-sm text-muted-foreground hover:text-primary hover:underline"
                      >
                        {p.display}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{t("contact.addressLabel")}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{contactAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{t("contact.hoursLabel")}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{businessHours}</p>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>

        {/* FAQ */}
        <FadeInSection>
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-6 text-center">{t("contact.faq")}</h2>
            <Accordion type="single" collapsible>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-medium">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}
