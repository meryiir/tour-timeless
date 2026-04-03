import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const MOROCCO_TZ = "Africa/Casablanca";

/** Live date & time in Morocco (Africa/Casablanca), updated every second. */
export default function MoroccoLiveClock({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const locale = i18n.resolvedLanguage ?? i18n.language ?? undefined;
  const formatted = new Intl.DateTimeFormat(locale, {
    timeZone: MOROCCO_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);

  return (
    <div
      className={cn(
        "flex flex-col items-end text-right shrink-0 max-w-[11rem] sm:max-w-none",
        className,
      )}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={t("admin.layout.moroccoLiveAria")}
    >
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none">
        {t("admin.layout.moroccoLiveTime")}
      </span>
      <time
        dateTime={now.toISOString()}
        className="text-xs font-medium tabular-nums text-foreground leading-tight mt-0.5"
      >
        {formatted}
      </time>
    </div>
  );
}
