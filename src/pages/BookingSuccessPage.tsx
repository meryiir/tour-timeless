import { useEffect, useMemo, type ComponentType } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Calendar,
  Users,
  Hash,
  MapPin,
  Mail,
  User,
  ArrowRight,
  Home,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FadeInSection from "@/components/FadeInSection";
import { Seo } from "@/components/seo/Seo";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { absoluteUrlWithLang } from "@/lib/siteUrl";
import { formatIsoDateOnly } from "@/lib/dateDisplay";
import {
  getBookingSuccessSnapshot,
  type BookingSuccessSnapshot,
} from "@/lib/bookingSuccess";

type LocationState = {
  booking?: BookingSuccessSnapshot;
};

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-0.5 text-sm font-semibold text-foreground break-words ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const booking = useMemo(() => {
    return state?.booking ?? getBookingSuccessSnapshot();
  }, [state?.booking]);

  useEffect(() => {
    if (!booking) {
      navigate("/", { replace: true });
    }
  }, [booking, navigate]);

  if (!booking) {
    return null;
  }

  const guestLabel =
    booking.numberOfPeople === 1
      ? t("bookingSuccess.guestSingular")
      : t("bookingSuccess.guestPlural", { count: booking.numberOfPeople });

  return (
    <div className="min-h-screen bg-background pt-[100px] pb-16 md:pb-24">
      <Seo
        title={t("seo.bookingSuccess.title")}
        description={t("seo.bookingSuccess.description")}
        url={absoluteUrlWithLang("/booking-success", i18n.language)}
        noIndex
      />

      <div className="container mx-auto px-4 max-w-3xl">
        <PageBreadcrumb
          items={[
            { label: t("nav.home"), to: "/" },
            { label: t("bookingSuccess.breadcrumb") },
          ]}
          currentPath="/booking-success"
          className="mb-2"
        />

        <FadeInSection>
          <div className="mt-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-8 ring-emerald-500/10">
              <CheckCircle2 className="h-11 w-11 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              {t("bookingSuccess.title")}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{t("bookingSuccess.subtitle")}</p>
          </div>
        </FadeInSection>

        <FadeInSection>
          <Card className="mt-10 overflow-hidden border-2 border-border/80 shadow-xl">
            <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-secondary" />
            <CardContent className="p-6 md:p-8 space-y-6">
              <p className="text-center text-sm md:text-base text-muted-foreground leading-relaxed">
                {t("bookingSuccess.description")}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow
                  icon={Hash}
                  label={t("bookingSuccess.bookingReference")}
                  value={booking.bookingReference}
                  mono
                />
                <DetailRow
                  icon={MapPin}
                  label={t("bookingSuccess.activityName")}
                  value={booking.activityTitle}
                />
                <DetailRow
                  icon={Calendar}
                  label={t("bookingSuccess.travelDate")}
                  value={formatIsoDateOnly(booking.travelDate)}
                />
                <DetailRow icon={Users} label={t("bookingSuccess.numberOfGuests")} value={guestLabel} />
                <DetailRow icon={User} label={t("bookingSuccess.customerName")} value={booking.customerName} />
                <DetailRow icon={Mail} label={t("bookingSuccess.customerEmail")} value={booking.customerEmail} />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:justify-center">
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link to="/profile?tab=bookings">
                    {t("bookingSuccess.viewMyBooking")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                  <Link to="/activities">
                    <Compass className="mr-2 h-4 w-4" />
                    {t("bookingSuccess.exploreMoreTours")}
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="rounded-full px-8">
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    {t("bookingSuccess.backToHome")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeInSection>
      </div>
    </div>
  );
}
