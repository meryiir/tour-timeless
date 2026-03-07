import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FadeInSection from "@/components/FadeInSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How do I book an activity?", a: "Browse our activities, select one you love, choose your preferred date and number of guests, then click 'Reserve Now'. You'll receive a confirmation email with all the details." },
  { q: "What is your cancellation policy?", a: "Most activities offer free cancellation up to 48 hours before the experience. Check individual activity pages for specific cancellation policies." },
  { q: "Are the activities suitable for children?", a: "Many of our activities are family-friendly! Check the difficulty level and age requirements on each activity page. Activities marked 'Easy' are generally suitable for all ages." },
  { q: "Do I need travel insurance?", a: "We strongly recommend travel insurance for all our experiences. While some activities include basic insurance, comprehensive coverage for your entire trip is advisable." },
  { q: "How can I contact my guide?", a: "After booking, you'll receive your guide's contact information via email. You can also reach them through our in-app messaging system." },
];

export default function ContactPage() {
  return (
    <div className="py-12">
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Contact Us</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">Have a question or need help planning your adventure? We'd love to hear from you.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <FadeInSection>
            <h2 className="font-display text-2xl font-bold mb-6">Send Us a Message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Your Name" />
                <Input placeholder="Your Email" type="email" />
              </div>
              <Input placeholder="Subject" />
              <Textarea placeholder="Your Message" className="min-h-[150px]" />
              <Button size="lg">Send Message</Button>
            </form>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <h2 className="font-display text-2xl font-bold mb-6">Get in Touch</h2>
            <div className="space-y-6 mb-8">
              {[
                { icon: Mail, label: "Email", value: "hello@wanderlust.com" },
                { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
                { icon: MapPin, label: "Address", value: "123 Travel Street, New York, NY 10001" },
                { icon: Clock, label: "Hours", value: "Mon-Fri: 9am-6pm EST" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{c.label}</p>
                    <p className="text-sm text-muted-foreground">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Map Placeholder */}
            <div className="aspect-video rounded-xl bg-muted flex items-center justify-center border border-border">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Map will be displayed here</p>
              </div>
            </div>
          </FadeInSection>
        </div>

        {/* FAQ */}
        <FadeInSection>
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
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
