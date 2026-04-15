import { useMemo, useState, type FormEvent } from "react";
import { MapPin, Send, CalendarDays, Users, Route, ArrowLeftRight } from "lucide-react";
import type { CountryCode } from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { publicApi } from "@/lib/publicApi";
import { CityCombobox } from "@/components/CityCombobox";
import { MOROCCO_CITIES } from "@/lib/moroccoCities";
import { PhoneNumberField } from "@/components/PhoneNumberField";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function emailLooksValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function CustomTripRequestForm({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const requiredMark = (
    <span className="ml-1 text-destructive" aria-hidden="true">
      *
    </span>
  );
  const fieldBorderClass =
    "rounded-sm border border-border/80 bg-background/60 focus-visible:ring-1 focus-visible:ring-primary/40";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>("MA");
  const [phoneE164, setPhoneE164] = useState("");
  const [phoneMeta, setPhoneMeta] = useState<{ hasInput: boolean; isValid: boolean }>({
    hasInput: false,
    isValid: true,
  });
  const [startCity, setStartCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t("customTrip.validation.nameRequired");
    if (!email.trim()) e.email = t("customTrip.validation.emailRequired");
    else if (!emailLooksValid(email)) e.email = t("customTrip.validation.emailInvalid");
    if (!startCity.trim()) e.startCity = t("customTrip.validation.startCityRequired");
    if (!destinationCity.trim()) e.destinationCity = t("customTrip.validation.destinationCityRequired");
    if (
      startCity.trim() &&
      destinationCity.trim() &&
      startCity.trim().toLowerCase() === destinationCity.trim().toLowerCase()
    ) {
      e.destinationCity = t("customTrip.validation.citiesMustDiffer");
    }
    if (numberOfPeople.trim()) {
      const n = Number(numberOfPeople);
      if (!Number.isFinite(n) || n < 1 || n > 40) e.numberOfPeople = t("customTrip.validation.guestsInvalid");
    }
    if (phoneMeta.hasInput && !phoneMeta.isValid) {
      e.phone = t("customTrip.validation.phoneInvalid");
    }
    return e;
  }, [
    name,
    email,
    startCity,
    destinationCity,
    numberOfPeople,
    phoneMeta.hasInput,
    phoneMeta.isValid,
    t,
  ]);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    return Object.keys(errors).length === 0;
  }, [loading, errors]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (!canSubmit) {
      toast({
        title: t("customTrip.toast.validationTitle"),
        description: t("customTrip.toast.validationDesc"),
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const people = numberOfPeople.trim() ? Number(numberOfPeople) : undefined;
      await publicApi.createCustomTripRequest({
        name: name.trim(),
        email: email.trim(),
        phone: phoneE164 || undefined,
        startCity: startCity.trim(),
        destinationCity: destinationCity.trim(),
        preferredDate: preferredDate || undefined,
        numberOfPeople: people,
        message: message.trim() || undefined,
      });
      setDone(true);
      toast({
        title: t("customTrip.toast.sentTitle"),
        description: t("customTrip.toast.sentDesc"),
      });
      setName("");
      setEmail("");
      setPhoneCountry("MA");
      setPhoneE164("");
      setPhoneMeta({ hasInput: false, isValid: true });
      setStartCity("");
      setDestinationCity("");
      setPreferredDate("");
      setNumberOfPeople("");
      setMessage("");
      setAttempted(false);
    } catch (err) {
      toast({
        title: t("customTrip.toast.errorTitle"),
        description: err instanceof Error ? err.message : t("customTrip.toast.errorDesc"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("w-full mt-4", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="rounded-sm border border-border/60 bg-card/80 backdrop-blur-sm shadow-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-2 p-7 sm:p-8 bg-gradient-to-br from-primary/8 via-background to-accent/6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Route className="h-4 w-4" />
                {t("customTrip.badge")}
              </div>
              <h2 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-foreground">
                {t("customTrip.title")}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed italic">
                {t("customTrip.subtitle")}
              </p>
              <div className="mt-6 space-y-3 text-sm text-muted-foreground italic">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                  <span>{t("customTrip.bullets.citiesSupported")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays className="h-4 w-4 mt-0.5 text-primary" />
                  <span>{t("customTrip.bullets.optionalDate")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-0.5 text-primary" />
                  <span>{t("customTrip.bullets.tailoredPlan")}</span>
                </div>
              </div>
              {done && (
                <div className="mt-6 rounded-sm border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">
                  {t("customTrip.successInline")}
                </div>
              )}
            </div>

            <div className="lg:col-span-3 p-7 sm:p-8">
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("customTrip.fields.name.label")}
                      {requiredMark}
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("customTrip.fields.name.placeholder")}
                      required
                      aria-required="true"
                      aria-invalid={attempted && !!errors.name}
                      className={cn(
                        fieldBorderClass,
                        attempted && errors.name && "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    {attempted && errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("customTrip.fields.email.label")}
                      {requiredMark}
                    </label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("customTrip.fields.email.placeholder")}
                      inputMode="email"
                      required
                      aria-required="true"
                      aria-invalid={attempted && !!errors.email}
                      className={cn(
                        fieldBorderClass,
                        attempted && errors.email && "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    {attempted && errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("customTrip.fields.startCity.label")}
                      {requiredMark}
                    </label>
                    <CityCombobox
                      value={startCity}
                      onChange={setStartCity}
                      cities={MOROCCO_CITIES}
                      placeholder={t("customTrip.fields.startCity.placeholder")}
                      disabled={loading}
                      className={fieldBorderClass}
                    />
                    {attempted && errors.startCity ? (
                      <p className="text-xs text-destructive">{errors.startCity}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm font-medium">
                        {t("customTrip.fields.destinationCity.label")}
                        {requiredMark}
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        disabled={loading || (!startCity && !destinationCity)}
                        onClick={() => {
                          setStartCity(destinationCity);
                          setDestinationCity(startCity);
                        }}
                        aria-label={t("customTrip.actions.swapAria")}
                      >
                        <ArrowLeftRight className="h-4 w-4 mr-1" />
                        {t("customTrip.actions.swap")}
                      </Button>
                    </div>
                    <CityCombobox
                      value={destinationCity}
                      onChange={setDestinationCity}
                      cities={MOROCCO_CITIES}
                      placeholder={t("customTrip.fields.destinationCity.placeholder")}
                      disabled={loading}
                      className={fieldBorderClass}
                    />
                    {attempted && errors.destinationCity ? (
                      <p className="text-xs text-destructive">{errors.destinationCity}</p>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("customTrip.fields.preferredDate.label")}</label>
                    <Input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      disabled={loading}
                      className={fieldBorderClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("customTrip.fields.guests.label")}</label>
                    <Input
                      type="number"
                      min={1}
                      max={40}
                      step={1}
                      value={numberOfPeople}
                      onChange={(e) => setNumberOfPeople(e.target.value)}
                      placeholder={t("customTrip.fields.guests.placeholder")}
                      inputMode="numeric"
                      disabled={loading}
                      aria-invalid={attempted && !!errors.numberOfPeople}
                      className={cn(
                        fieldBorderClass,
                        attempted && errors.numberOfPeople && "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    {attempted && errors.numberOfPeople ? (
                      <p className="text-xs text-destructive">{errors.numberOfPeople}</p>
                    ) : null}
                  </div>
                </div>

                <PhoneNumberField
                  label={t("customTrip.fields.phone.label")}
                  valueE164={phoneE164}
                  onChangeE164={setPhoneE164}
                  onMetaChange={setPhoneMeta}
                  country={phoneCountry}
                  onChangeCountry={setPhoneCountry}
                  disabled={loading}
                />
                {attempted && errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("customTrip.fields.notes.label")}</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("customTrip.fields.notes.placeholder")}
                    disabled={loading}
                    className={fieldBorderClass}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-1">
                  <p className="text-xs text-muted-foreground">
                    {t("customTrip.consent")}
                  </p>
                  <Button type="submit" disabled={!canSubmit} className="sm:min-w-[180px]">
                    {loading ? t("customTrip.actions.sending") : t("customTrip.actions.send")}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

