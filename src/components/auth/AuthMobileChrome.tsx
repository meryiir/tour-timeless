import { Link } from "react-router-dom";
import { CalendarCheck, ChevronLeft, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_HERO = "/login-hero.png";

/** Compact hero strip — only visible below `lg` (desktop uses split layout). */
export function AuthMobileHero({
  title,
  subtitle,
  imageSrc = DEFAULT_HERO,
}: {
  title: string;
  subtitle?: string;
  imageSrc?: string;
}) {
  return (
    <div className="relative lg:hidden shrink-0 overflow-hidden rounded-b-2xl bg-black pt-[env(safe-area-inset-top)] shadow-md ring-1 ring-black/20 dark:ring-white/10">
      <div className="relative h-[10.5rem] min-h-[10.5rem] sm:h-[12rem] sm:min-h-[12rem]">
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_32%] scale-[1.02] motion-reduce:scale-100"
          decoding="async"
        />
        {/* Uniform dark wash — avoids bright / blown-out areas on the right */}
        <div className="absolute inset-0 bg-black/45" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/25"
          aria-hidden
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-5 sm:p-5 sm:pb-6">
          <h2 className="font-display text-lg sm:text-xl font-semibold tracking-tight text-white text-balance [text-shadow:0_2px_12px_rgba(0,0,0,0.65)]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1.5 text-xs sm:text-sm text-white/90 leading-snug max-w-md text-pretty [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Short value props between hero and form — mobile only. */
export function AuthMobileQuickTrust({ className }: { className?: string }) {
  const { t } = useTranslation();
  const items = [
    { icon: ShieldCheck, label: t("auth.mobileTrustSecure") },
    { icon: CalendarCheck, label: t("auth.mobileTrustTrips") },
    { icon: Sparkles, label: t("auth.mobileTrustCurated") },
  ] as const;

  return (
    <div
      className={cn(
        "lg:hidden flex flex-wrap justify-center gap-2 border-b border-border/40 bg-muted/40 px-2 py-2.5 sm:px-4",
        className,
      )}
    >
      {items.map(({ icon: Icon, label }, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/90 px-2.5 py-1.5 text-[11px] font-medium text-foreground/90 shadow-sm"
        >
          <Icon className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}

/** Thumb-friendly top row: home + optional secondary link (e.g. Sign up / Sign in). */
export function AuthMobileTopBar({
  secondaryLink,
  className,
}: {
  secondaryLink?: { label: string; to: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "lg:hidden sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/50 bg-background/90 px-4 py-2 backdrop-blur-md supports-[backdrop-filter]:bg-background/75",
        className,
      )}
      style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
    >
      <Link
        to="/"
        className="inline-flex items-center gap-0.5 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors min-h-[44px] min-w-[44px] -ml-2 pl-2 pr-2 rounded-lg active:bg-muted/80"
      >
        <ChevronLeft className="h-5 w-5 shrink-0 -mr-0.5" aria-hidden />
        <span>Home</span>
      </Link>
      {secondaryLink ? (
        <Link
          to={secondaryLink.to}
          className="text-sm font-semibold text-primary hover:underline underline-offset-4 min-h-[44px] inline-flex items-center px-2 -mr-2 rounded-lg active:bg-primary/10"
        >
          {secondaryLink.label}
        </Link>
      ) : (
        <span className="min-w-[44px]" aria-hidden />
      )}
    </div>
  );
}

/** Elevated card on small screens only; desktop stays flat to match existing split layout. */
export function AuthFormCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-lg:rounded-2xl max-lg:border max-lg:border-border/70 max-lg:bg-card max-lg:p-5 max-lg:shadow-card max-lg:ring-1 max-lg:ring-black/[0.06] max-lg:dark:ring-white/10 max-lg:backdrop-blur-md sm:max-lg:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Shared input sizing for auth forms — 44px min touch target on small screens. */
export const authInputClassName = "h-12 sm:h-11 min-h-[44px] text-base sm:text-sm";

/** Primary actions on auth flows */
export const authButtonClassName = "w-full min-h-[48px] h-12 sm:h-11 text-base font-medium touch-manipulation";

/** Line with centered label (OAuth ↔ email) */
export function AuthOAuthDivider({ label }: { label: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border max-lg:border-border/80" />
      </div>
      <div className="relative flex justify-center text-[11px] uppercase tracking-wide">
        <span className="bg-card px-2 text-muted-foreground lg:bg-background">{label}</span>
      </div>
    </div>
  );
}

const googleIcon = (
  <svg className="mr-2 h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export function AuthGoogleButton({
  onClick,
  disabled,
  loading,
  loadingLabel,
  label,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel: string;
  label: string;
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      type="button"
      className={cn(
        authButtonClassName,
        "border-2 hover:bg-muted hover:border-primary/30 hover:shadow-sm hover:text-foreground transition-all duration-200",
        className,
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? loadingLabel : (
        <>
          {googleIcon}
          {label}
        </>
      )}
    </Button>
  );
}
