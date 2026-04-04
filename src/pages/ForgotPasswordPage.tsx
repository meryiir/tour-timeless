import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MoroccoMosaicLogo from "@/components/MoroccoMosaicLogo";
import { Seo } from "@/components/seo/Seo";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import {
  AuthFormCard,
  AuthMobileHero,
  AuthMobileQuickTrust,
  AuthMobileTopBar,
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/AuthMobileChrome";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[100dvh] min-h-screen flex flex-col lg:flex-row">
      <Seo
        title={t("seo.forgotPassword.title")}
        description={t("seo.forgotPassword.description")}
        canonicalPath="/forgot-password"
        noIndex
      />

      <div className="hidden lg:flex lg:w-1/2 relative min-h-screen overflow-hidden bg-stone-950">
        <img
          src="/login-hero.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_32%]"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/50 to-amber-950/20" aria-hidden />
        <div className="relative z-10 flex flex-col justify-between p-10 text-white h-full min-h-screen">
          <Link
            to="/"
            className="group inline-flex w-fit items-center rounded-lg bg-black/30 px-2.5 py-2 backdrop-blur-md ring-1 ring-white/12"
          >
            <MoroccoMosaicLogo
              size="sm"
              variant="compact"
              showTagline={false}
              className="gap-2 [&_span]:!text-xs [&_span]:!leading-tight"
            />
          </Link>
          <div className="max-w-md">
            <h2 className="font-display text-2xl font-semibold tracking-tight">{t("breadcrumb.forgotPassword")}</h2>
            <p className="mt-2 text-sm text-white/75 leading-relaxed">{t("auth.forgotPasswordHeroSubtitle")}</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col flex-1 min-h-0 min-h-[100dvh] lg:min-h-screen bg-gradient-to-b from-muted/35 via-background to-muted/20 lg:bg-background">
        <AuthMobileHero title={t("breadcrumb.forgotPassword")} subtitle={t("auth.forgotPasswordHeroSubtitle")} />
        <AuthMobileQuickTrust />
        <AuthMobileTopBar secondaryLink={{ label: t("auth.signIn"), to: "/login" }} />

        <div className="flex-1 flex flex-col justify-start lg:justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:p-12">
          <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in-up">
            <PageBreadcrumb
              className="hidden lg:flex"
              items={[
                { label: t("nav.home"), to: "/" },
                { label: t("breadcrumb.forgotPassword") },
              ]}
              currentPath="/forgot-password"
              includeJsonLd={false}
            />

            <AuthFormCard>
              <div className="space-y-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {t("breadcrumb.forgotPassword")}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground text-pretty">{t("auth.forgotPasswordDescription")}</p>
              </div>

              <form className="space-y-4 mt-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label htmlFor="forgot-email" className="text-sm font-medium text-foreground">
                    {t("auth.email")}
                  </label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    className={authInputClassName}
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
                <Button className={`${authButtonClassName} group`} size="lg" type="submit">
                  {t("auth.sendResetLink")}
                </Button>
              </form>

              <p className="text-sm text-center text-muted-foreground pt-6 border-t border-border/60 mt-6">
                {t("auth.rememberPassword")}{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  {t("auth.signIn")}
                </Link>
              </p>
            </AuthFormCard>
          </div>
        </div>
      </div>
    </div>
  );
}
