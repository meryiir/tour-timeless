import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FadeInSection from "@/components/FadeInSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { publicApi } from "@/lib/publicApi";
import {
  SITE_CONTACT_EMAIL,
  SITE_CONTACT_PHONE_DISPLAY,
  siteContactMailto,
  siteContactTel,
} from "@/lib/siteContact";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isClient = user?.role === "ROLE_CLIENT";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user && isClient) {
      setEmail((prev) => prev || user.email || "");
      setName((prev) => prev || `${user.firstName} ${user.lastName}`.trim() || "");
    }
  }, [user, isClient]);

  const submitMutation = useMutation({
    mutationFn: () =>
      publicApi.submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      }),
    onSuccess: () => {
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["myContactMessages"] });
      toast({
        title: t("contact.sent"),
        description: t("contact.sentToAdmin"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("contact.sendFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const n = name.trim();
      const em = email.trim();
      const s = subject.trim();
      const m = message.trim();
      if (!n || !em || !s || !m) {
        toast({
          title: t("contact.validationTitle"),
          description: t("contact.fillAllFields"),
          variant: "destructive",
        });
        return;
      }
      if (!EMAIL_RE.test(em)) {
        toast({
          title: t("contact.validationTitle"),
          description: t("contact.invalidEmail"),
          variant: "destructive",
        });
        return;
      }
      submitMutation.mutate();
    },
    [name, email, subject, message, toast, t, submitMutation],
  );

  const faqs = [
    { q: t("contact.faqBook"), a: t("contact.faqBookAnswer") },
    { q: t("contact.faqCancel"), a: t("contact.faqCancelAnswer") },
    { q: t("contact.faqChildren"), a: t("contact.faqChildrenAnswer") },
    { q: t("contact.faqInsurance"), a: t("contact.faqInsuranceAnswer") },
    { q: t("contact.faqGuide"), a: t("contact.faqGuideAnswer") },
  ];
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
            <h2 className={`font-display text-2xl font-bold ${isClient ? "mb-2" : "mb-6"}`}>
              {t("contact.sendMessage")}
            </h2>
            {isClient && (
              <p className="text-sm text-muted-foreground mb-6">{t("profile.contactUsHint")}</p>
            )}
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  placeholder={t("contact.yourName")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitMutation.isPending}
                />
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("contact.yourEmail")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitMutation.isPending}
                />
              </div>
              <Input
                id="contact-subject"
                name="subject"
                autoComplete="off"
                placeholder={t("contact.subject")}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={submitMutation.isPending}
              />
              <Textarea
                id="contact-message"
                name="message"
                autoComplete="off"
                placeholder={t("contact.yourMessage")}
                className="min-h-[150px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={submitMutation.isPending}
              />
              <Button type="submit" size="lg" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? t("contact.sending") : t("contact.send")}
              </Button>
            </form>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <h2 className="font-display text-2xl font-bold mb-6">{t("contact.getInTouch")}</h2>
            <div className="space-y-6 mb-8">
              {(
                [
                  {
                    icon: Mail,
                    label: t("contact.emailLabel"),
                    value: SITE_CONTACT_EMAIL,
                    href: siteContactMailto,
                  },
                  {
                    icon: Phone,
                    label: t("contact.phoneLabel"),
                    value: SITE_CONTACT_PHONE_DISPLAY,
                    href: siteContactTel,
                  },
                  {
                    icon: MapPin,
                    label: t("contact.addressLabel"),
                    value: "123 Travel Street, New York, NY 10001",
                  },
                  { icon: Clock, label: t("contact.hoursLabel"), value: "Mon-Fri: 9am-6pm EST" },
                ]
              ).map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{c.label}</p>
                    {"href" in c ? (
                      <a
                        href={c.href}
                        className="text-sm text-primary font-medium hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Map Placeholder */}
            <div className="aspect-video rounded-xl bg-muted flex items-center justify-center border border-border">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("contact.mapDisplayed")}</p>
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
